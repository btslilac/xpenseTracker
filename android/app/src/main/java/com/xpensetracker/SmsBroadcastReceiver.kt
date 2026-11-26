package com.xpensetracker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class SmsBroadcastReceiver : BroadcastReceiver() {

  companion object {
    const val PREFS_NAME = "xpense_sms_capture"
    const val KEY_ENABLED = "sms_capture_enabled"
    const val KEY_USER_ID = "configured_user_id"
    const val KEY_PENDING_JSON = "pending_sms_events"
    const val KEY_LAST_INBOX_SCAN_MS = "last_inbox_scan_ms"
    private const val MAX_PENDING_EVENTS = 50
    val STORAGE_LOCK = Any()

    private val PHONE_NUMBER_REGEX = Regex("^(?:\\+?254|0)?[17]\\d{8}$")
    private val TRUSTED_SENDERS = listOf(
      "MPESA", "M-PESA", "SAFARICOM",
      "KCB", "EQUITY", "CO-OP", "COOP", "NCBA", "ABSA",
      "STANBIC", "STANCHART", "I&M", "IMBANK", "PESALINK",
      "DTB", "FAMILY", "SIDIAN", "LOOP", "FULIZA", "TIMIZA", "TALA", "BRANCH",
      "HF", "MSHWARI", "M-SHWARI", "AIRTEL", "T-KASH"
    )
    internal val IGNORE_KEYWORDS = Regex(
      "\\b(otp|one[- ]?time\\s+(?:password|pin|code)|verification\\s+code|do\\s+not\\s+share|pin\\s+is)\\b",
      RegexOption.IGNORE_CASE
    )
    internal val TRANSACTION_KEYWORDS = Regex(
      "\\b(confirmed|credited|debited|sent\\s+to|paid\\s+to|you\\s+bought|withdraw|have\\s+received|received|transferred|pesalink|pos\\s+purchase|reversed|fuliza|airtime|bundles|m-?pesa)|(?:\\b(?:kshs?|kes|usd|eur|gbp|ugx|tzs)(?=[\\s.\\d]))",
      RegexOption.IGNORE_CASE
    )

    internal fun isTrustedSender(sender: String): Boolean {
      val clean = sender.uppercase().replace(Regex("\\s+"), "")
      if (clean.isBlank() || PHONE_NUMBER_REGEX.matches(clean)) return false
      return TRUSTED_SENDERS.any { clean.contains(it) }
    }

    internal fun shouldCaptureSms(sender: String, body: String): Boolean {
      if (!isTrustedSender(sender)) return false
      if (IGNORE_KEYWORDS.containsMatchIn(body)) return false
      if (!TRANSACTION_KEYWORDS.containsMatchIn(body)) return false
      return true
    }
  }

  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return

    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    if (!prefs.getBoolean(KEY_ENABLED, false)) {
      return
    }

    val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
    if (messages.isNullOrEmpty()) return

    val userId = prefs.getString(KEY_USER_ID, "") ?: ""
    val groupedBodies = LinkedHashMap<String, StringBuilder>()
    val groupedSenders = LinkedHashMap<String, String>()
    val groupedTimestamps = LinkedHashMap<String, Long>()

    for (msg in messages) {
      val sender = (msg.displayOriginatingAddress ?: msg.originatingAddress ?: "").trim()
      val bodyPart = msg.messageBody ?: ""
      if (sender.isBlank() || bodyPart.isBlank()) continue
      val key = "${sender}_${msg.timestampMillis / 2000L}"
      groupedSenders[key] = sender
      groupedTimestamps[key] = if (msg.timestampMillis > 0L) msg.timestampMillis else System.currentTimeMillis()
      val sb = groupedBodies.getOrPut(key) { StringBuilder() }
      sb.append(bodyPart)
    }

    if (groupedBodies.isEmpty()) return

    var addedAny = false
    synchronized(STORAGE_LOCK) {
      val existingRaw = prefs.getString(KEY_PENDING_JSON, "[]") ?: "[]"
      val queue = try {
        JSONArray(existingRaw)
      } catch (_: Throwable) {
        JSONArray()
      }

      for ((key, sb) in groupedBodies) {
        val sender = groupedSenders[key] ?: continue
        val body = sb.toString().trim()
        if (!shouldCaptureSms(sender, body)) continue

        val eventObj = JSONObject().apply {
          put("id", "sms_" + UUID.randomUUID().toString())
          put("userId", userId)
          put("sender", sender)
          put("rawBody", body)
          put("receivedAt", groupedTimestamps[key] ?: System.currentTimeMillis())
        }
        queue.put(eventObj)
        addedAny = true
      }

      if (addedAny) {
        val trimmed = if (queue.length() > MAX_PENDING_EVENTS) {
          val sliced = JSONArray()
          val start = queue.length() - MAX_PENDING_EVENTS
          for (i in start until queue.length()) {
            sliced.put(queue.get(i))
          }
          sliced
        } else {
          queue
        }
        prefs.edit().putString(KEY_PENDING_JSON, trimmed.toString()).commit()
      }
    }

    if (addedAny) {
      SmsExpenseCaptureModule.notifyPendingChanged()
    }
  }
}

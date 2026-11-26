package com.xpensetracker

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.provider.Telephony
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONArray
import org.json.JSONObject
import java.lang.ref.WeakReference
import java.util.UUID

class SmsExpenseCaptureModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    @Volatile
    private var activeContextRef: WeakReference<ReactApplicationContext>? = null

    fun notifyPendingChanged() {
      val ctx = activeContextRef?.get() ?: return
      if (!ctx.hasActiveReactInstance()) return
      try {
        ctx
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
          .emit("SmsExpenseCapturePendingChanged", null)
      } catch (_: Throwable) {
        // React runtime might be backgrounded or tearing down
      }
    }
  }

  init {
    activeContextRef = WeakReference(reactContext)
  }

  override fun getName(): String = "SmsExpenseCapture"

  override fun invalidate() {
    if (activeContextRef?.get() === reactApplicationContext) {
      activeContextRef = null
    }
    super.invalidate()
  }

  @ReactMethod
  fun addListener(eventName: String) {
    // Required by NativeEventEmitter contract
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // Required by NativeEventEmitter contract
  }

  @ReactMethod
  fun configure(configJson: String, promise: Promise) {
    try {
      val obj = JSONObject(configJson)
      val userId = obj.optString("userId", "")
      val enabled = obj.optBoolean("enabled", false)
      val prefs = reactApplicationContext.getSharedPreferences(
        SmsBroadcastReceiver.PREFS_NAME,
        Context.MODE_PRIVATE
      )
      synchronized(SmsBroadcastReceiver.STORAGE_LOCK) {
        val editor = prefs.edit()
          .putString(SmsBroadcastReceiver.KEY_USER_ID, userId)
          .putBoolean(SmsBroadcastReceiver.KEY_ENABLED, enabled)
        if (enabled && prefs.getLong(SmsBroadcastReceiver.KEY_LAST_INBOX_SCAN_MS, 0L) <= 0L) {
          // Initialize lookback watermark 15 minutes back on first enable
          editor.putLong(
            SmsBroadcastReceiver.KEY_LAST_INBOX_SCAN_MS,
            System.currentTimeMillis() - (15L * 60L * 1000L)
          )
        }
        editor.apply()
      }
      promise.resolve(null)
    } catch (t: Throwable) {
      promise.reject("SMS_CONFIGURE_ERR", t.message, t)
    }
  }

  /**
   * Scans SMS Inbox messages received after KEY_LAST_INBOX_SCAN_MS to recover any
   * alerts dropped by OEM background restrictions while the app was closed.
   */
  @ReactMethod
  fun scanRecentInboxTransactions(promise: Promise) {
    try {
      val prefs = reactApplicationContext.getSharedPreferences(
        SmsBroadcastReceiver.PREFS_NAME,
        Context.MODE_PRIVATE
      )
      if (!prefs.getBoolean(SmsBroadcastReceiver.KEY_ENABLED, false)) {
        promise.resolve("[]")
        return
      }
      val readGranted = ContextCompat.checkSelfPermission(
        reactApplicationContext,
        Manifest.permission.READ_SMS
      ) == PackageManager.PERMISSION_GRANTED
      if (!readGranted) {
        promise.resolve("[]")
        return
      }

      val userId = prefs.getString(SmsBroadcastReceiver.KEY_USER_ID, "") ?: ""
      val now = System.currentTimeMillis()
      val storedSince = prefs.getLong(SmsBroadcastReceiver.KEY_LAST_INBOX_SCAN_MS, 0L)
      val maxLookback = now - (24L * 60L * 60L * 1000L)
      val sinceMs = if (storedSince > maxLookback) storedSince else maxLookback

      val results = JSONArray()
      var newestTs = sinceMs

      val projection = arrayOf(
        Telephony.Sms.ADDRESS,
        Telephony.Sms.BODY,
        Telephony.Sms.DATE
      )
      val selection = "${Telephony.Sms.DATE} > ?"
      val selectionArgs = arrayOf(sinceMs.toString())
      val sortOrder = "${Telephony.Sms.DATE} ASC"

      reactApplicationContext.contentResolver.query(
        Telephony.Sms.Inbox.CONTENT_URI,
        projection,
        selection,
        selectionArgs,
        sortOrder
      )?.use { cursor ->
        val idxAddress = cursor.getColumnIndex(Telephony.Sms.ADDRESS)
        val idxBody = cursor.getColumnIndex(Telephony.Sms.BODY)
        val idxDate = cursor.getColumnIndex(Telephony.Sms.DATE)
        var capturedCount = 0

        while (cursor.moveToNext() && capturedCount < 25) {
          val sender = if (idxAddress >= 0) (cursor.getString(idxAddress) ?: "").trim() else ""
          val body = if (idxBody >= 0) (cursor.getString(idxBody) ?: "").trim() else ""
          val dateMs = if (idxDate >= 0) cursor.getLong(idxDate) else now

          if (dateMs > newestTs) {
            newestTs = dateMs
          }

          if (sender.isBlank() || body.isBlank()) continue
          if (!SmsBroadcastReceiver.shouldCaptureSms(sender, body)) continue

          results.put(JSONObject().apply {
            put("id", "inbox_" + UUID.randomUUID().toString())
            put("userId", userId)
            put("sender", sender)
            put("rawBody", body)
            put("receivedAt", dateMs)
          })
          capturedCount++
        }
      }

      prefs.edit().putLong(SmsBroadcastReceiver.KEY_LAST_INBOX_SCAN_MS, maxOf(newestTs, now - 5000L)).apply()
      promise.resolve(results.toString())
    } catch (_: Throwable) {
      promise.resolve("[]")
    }
  }

  @ReactMethod
  fun clearConfiguration(promise: Promise) {
    try {
      val prefs = reactApplicationContext.getSharedPreferences(
        SmsBroadcastReceiver.PREFS_NAME,
        Context.MODE_PRIVATE
      )
      synchronized(SmsBroadcastReceiver.STORAGE_LOCK) {
        prefs.edit()
          .remove(SmsBroadcastReceiver.KEY_USER_ID)
          .putBoolean(SmsBroadcastReceiver.KEY_ENABLED, false)
          .apply()
      }
      promise.resolve(null)
    } catch (t: Throwable) {
      promise.reject("SMS_CLEAR_ERR", t.message, t)
    }
  }

  @ReactMethod
  fun getPendingTransactions(promise: Promise) {
    try {
      val prefs = reactApplicationContext.getSharedPreferences(
        SmsBroadcastReceiver.PREFS_NAME,
        Context.MODE_PRIVATE
      )
      val json = synchronized(SmsBroadcastReceiver.STORAGE_LOCK) {
        prefs.getString(SmsBroadcastReceiver.KEY_PENDING_JSON, "[]") ?: "[]"
      }
      promise.resolve(json)
    } catch (t: Throwable) {
      promise.reject("SMS_GET_PENDING_ERR", t.message, t)
    }
  }

  @ReactMethod
  fun removePendingTransactions(ids: ReadableArray, promise: Promise) {
    try {
      val toRemove = HashSet<String>()
      for (i in 0 until ids.size()) {
        val value = ids.getString(i)
        if (!value.isNullOrBlank()) {
          toRemove.add(value)
        }
      }
      if (toRemove.isEmpty()) {
        promise.resolve(null)
        return
      }
      val prefs = reactApplicationContext.getSharedPreferences(
        SmsBroadcastReceiver.PREFS_NAME,
        Context.MODE_PRIVATE
      )
      synchronized(SmsBroadcastReceiver.STORAGE_LOCK) {
        val existingRaw = prefs.getString(SmsBroadcastReceiver.KEY_PENDING_JSON, "[]") ?: "[]"
        val arr = try {
          JSONArray(existingRaw)
        } catch (_: Throwable) {
          JSONArray()
        }
        val next = JSONArray()
        for (i in 0 until arr.length()) {
          val item = arr.optJSONObject(i) ?: continue
          val itemId = item.optString("id", "")
          if (!toRemove.contains(itemId)) {
            next.put(item)
          }
        }
        prefs.edit().putString(SmsBroadcastReceiver.KEY_PENDING_JSON, next.toString()).commit()
      }
      promise.resolve(null)
    } catch (t: Throwable) {
      promise.reject("SMS_REMOVE_PENDING_ERR", t.message, t)
    }
  }

  @ReactMethod
  fun hasSmsPermission(promise: Promise) {
    try {
      val receiveGranted = ContextCompat.checkSelfPermission(
        reactApplicationContext,
        Manifest.permission.RECEIVE_SMS
      ) == PackageManager.PERMISSION_GRANTED
      val readGranted = ContextCompat.checkSelfPermission(
        reactApplicationContext,
        Manifest.permission.READ_SMS
      ) == PackageManager.PERMISSION_GRANTED
      promise.resolve(receiveGranted && readGranted)
    } catch (_: Throwable) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun hasOverlayPermission(promise: Promise) {
    try {
      val granted = Build.VERSION.SDK_INT < Build.VERSION_CODES.M ||
        Settings.canDrawOverlays(reactApplicationContext)
      promise.resolve(granted)
    } catch (_: Throwable) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun hasNotificationAccess(promise: Promise) {
    try {
      val enabled = NotificationManagerCompat
        .getEnabledListenerPackages(reactApplicationContext)
        .contains(reactApplicationContext.packageName)
      promise.resolve(enabled)
    } catch (_: Throwable) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun openOverlayPermissionSettings(promise: Promise) {
    try {
      val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        Intent(
          Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
          Uri.parse("package:${reactApplicationContext.packageName}")
        )
      } else {
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${reactApplicationContext.packageName}"))
      }
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactApplicationContext.startActivity(intent)
      promise.resolve(null)
    } catch (_: Throwable) {
      promise.resolve(null)
    }
  }

  @ReactMethod
  fun openNotificationAccessSettings(promise: Promise) {
    try {
      val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      reactApplicationContext.startActivity(intent)
      promise.resolve(null)
    } catch (_: Throwable) {
      try {
        val fallback = Intent(
          Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
          Uri.parse("package:${reactApplicationContext.packageName}")
        ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
        reactApplicationContext.startActivity(fallback)
      } catch (_: Throwable) {}
      promise.resolve(null)
    }
  }
}

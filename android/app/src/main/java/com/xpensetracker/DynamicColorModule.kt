package com.xpensetracker

import android.os.Build
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DynamicColorModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "DynamicColor"

  private fun colorIntToHex(colorResId: Int): String? {
    return try {
      val color = ContextCompat.getColor(reactApplicationContext, colorResId)
      String.format("#%06X", 0xFFFFFF and color)
    } catch (_: Throwable) {
      null
    }
  }

  @ReactMethod
  fun getDynamicPalette(promise: Promise) {
    try {
      val result = Arguments.createMap()
      result.putInt("sdkInt", Build.VERSION.SDK_INT)

      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
        result.putBoolean("supported", false)
        result.putString("reason", "Requires Android 12 (API 31) or higher.")
        promise.resolve(result)
        return
      }

      val colors = Arguments.createMap()
      val tokenMap = mapOf(
        "accent1_100" to android.R.color.system_accent1_100,
        "accent1_200" to android.R.color.system_accent1_200,
        "accent1_500" to android.R.color.system_accent1_500,
        "accent1_600" to android.R.color.system_accent1_600,
        "accent1_700" to android.R.color.system_accent1_700,
        "accent1_800" to android.R.color.system_accent1_800,
        "accent1_900" to android.R.color.system_accent1_900,
        "accent2_100" to android.R.color.system_accent2_100,
        "accent2_200" to android.R.color.system_accent2_200,
        "accent2_500" to android.R.color.system_accent2_500,
        "accent2_600" to android.R.color.system_accent2_600,
        "accent2_700" to android.R.color.system_accent2_700,
        "accent2_900" to android.R.color.system_accent2_900,
        "accent3_100" to android.R.color.system_accent3_100,
        "accent3_200" to android.R.color.system_accent3_200,
        "accent3_600" to android.R.color.system_accent3_600,
        "accent3_700" to android.R.color.system_accent3_700,
        "accent3_900" to android.R.color.system_accent3_900,
        "neutral1_10" to android.R.color.system_neutral1_10,
        "neutral1_50" to android.R.color.system_neutral1_50,
        "neutral1_100" to android.R.color.system_neutral1_100,
        "neutral1_800" to android.R.color.system_neutral1_800,
        "neutral1_900" to android.R.color.system_neutral1_900,
        "neutral1_1000" to android.R.color.system_neutral1_1000,
        "neutral2_100" to android.R.color.system_neutral2_100,
        "neutral2_200" to android.R.color.system_neutral2_200,
        "neutral2_400" to android.R.color.system_neutral2_400,
        "neutral2_500" to android.R.color.system_neutral2_500,
        "neutral2_700" to android.R.color.system_neutral2_700,
        "neutral2_800" to android.R.color.system_neutral2_800,
        "neutral2_900" to android.R.color.system_neutral2_900
      )

      var extractedCount = 0
      for ((key, resId) in tokenMap) {
        val hex = colorIntToHex(resId)
        if (hex != null) {
          colors.putString(key, hex)
          extractedCount++
        }
      }

      if (extractedCount == 0) {
        result.putBoolean("supported", false)
        result.putString("reason", "System Monet resources returned no colors.")
        promise.resolve(result)
        return
      }

      result.putBoolean("supported", true)
      result.putMap("colors", colors)
      promise.resolve(result)
    } catch (t: Throwable) {
      val fallback = Arguments.createMap()
      fallback.putBoolean("supported", false)
      fallback.putInt("sdkInt", Build.VERSION.SDK_INT)
      fallback.putString("reason", t.message ?: "Failed to read system dynamic palette")
      promise.resolve(fallback)
    }
  }
}

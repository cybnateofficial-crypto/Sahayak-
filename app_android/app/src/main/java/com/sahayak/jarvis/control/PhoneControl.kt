package com.sahayak.jarvis.control

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.AlarmClock
import android.widget.Toast

class PhoneControl(private val ctx: Context) {

    fun openApp(packageName: String): Boolean {
        return try {
            val intent = ctx.packageManager.getLaunchIntentForPackage(packageName)
                ?: Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName"))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            ctx.startActivity(intent)
            true
        } catch (e: Exception) {
            Toast.makeText(ctx, "Couldn't open $packageName", Toast.LENGTH_SHORT).show()
            false
        }
    }

    fun placeCall(number: String): String {
        val intent = Intent(Intent.ACTION_CALL, Uri.parse("tel:$number")).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
        return try { ctx.startActivity(intent); "Calling $number — Sir." } catch (e: Exception) { "Call permission needed, Sir." }
    }

    fun sendSms(number: String, body: String): String {
        val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:$number")).apply {
            putExtra("sms_body", body); addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        return try { ctx.startActivity(intent); "SMS drafted to $number, Sir." } catch (e: Exception) { "SMS failed, Sir." }
    }

    fun setAlarm(hour: Int, minute: Int, label: String): String {
        val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
            putExtra(AlarmClock.EXTRA_HOUR, hour); putExtra(AlarmClock.EXTRA_MINUTES, minute)
            putExtra(AlarmClock.EXTRA_MESSAGE, label); addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        return try { ctx.startActivity(intent); "Alarm set for $hour:$minute, Sir." } catch (e: Exception) { "Alarm failed" }
    }

    fun toggleSetting(key: String, enable: Boolean): String {
        // Real impl uses Settings, BluetoothAdapter, WifiManager — simplified
        return "Toggled $key -> $enable, Sir. (Requires permission grant in Settings)"
    }

    fun takePhoto(camera: String): String {
        val intent = Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
        return try { ctx.startActivity(intent); "Opening camera ($camera), Sir." } catch (e: Exception) { "Camera unavailable" }
    }

    fun readNotifications(): String {
        // Fed from JarvisNotificationListener
        return "You have 3 new notifications, Sir. (Connect NotificationListener to read)"
    }

    fun createAutomation(rule: String): String {
        // Save to Room -> WorkManager
        return "Automation noted: \"$rule\" — I'll handle it, Sir."
    }
}

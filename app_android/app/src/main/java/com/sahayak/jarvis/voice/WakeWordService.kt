package com.sahayak.jarvis.voice

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder

/**
 * Always-on wake word "Hey Jarvis" using Porcupine.
 * In battery saver, falls back to tap-to-talk.
 */
class WakeWordService : Service() {
    override fun onCreate() {
        super.onCreate()
        createChannel()
        // Init PorcupineManager with keyword file hey-jarvis_android.ppn
        // PorcupineManager.Builder().setKeywordPath("hey-jarvis.ppn").setSensitivity(0.7).build(this) { onWakeWord() }
    }

    private fun onWakeWord() {
        // Haptic feedback + start JarvisVoiceService listening
        startService(Intent(this, JarvisVoiceService::class.java))
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(101, buildNotification())
        return START_STICKY
    }

    private fun buildNotification(): Notification {
        val nm = getSystemService(NotificationManager::class.java)
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, "jarvis_wake").setContentTitle("JARVIS listening… Sir")
                .setContentText("Say 'Hey Jarvis'").setSmallIcon(android.R.drawable.ic_btn_speak_now).build()
        } else {
            Notification.Builder(this).setContentTitle("JARVIS listening…").setSmallIcon(android.R.drawable.ic_btn_speak_now).build()
        }
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel("jarvis_wake", "JARVIS Wake Word", NotificationManager.IMPORTANCE_LOW)
            getSystemService(NotificationManager::class.java).createNotificationChannel(ch)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}

package com.sahayak.jarvis.control

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class JarvisNotificationListener : NotificationListenerService() {
    companion object {
        val liveNotifications = mutableListOf<String>()
    }
    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        sbn?.let {
            val text = "${it.packageName}: ${it.notification.extras.getString("android.text")}"
            liveNotifications.add(text)
            if (liveNotifications.size > 50) liveNotifications.removeAt(0)
        }
    }
}

# Permissions for Full Control

Enable in order:

1. Microphone (for Hey Jarvis)
2. Notifications → BIND_NOTIFICATION_LISTENER_SERVICE (read WhatsApp etc)
3. Accessibility → SAHAYAK JARVIS (tap automation)
4. Battery optimization → Don't optimize (keep wake word alive)
5. Default assistant → Select SAHAYAK (long-press home)

ADB grant for power toggles:

adb shell pm grant com.sahayak.jarvis android.permission.WRITE_SECURE_SETTINGS

package com.sahayak.jarvis.control

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

/**
 * Used for full phone control: auto-tap, fill, scroll in WhatsApp/Instagram etc.
 * User must enable in Settings → Accessibility → SAHAYAK JARVIS
 */
class JarvisAccessibilityService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Forward to automation engine if a rule is active
        // e.g., auto-reply WhatsApp
    }
    override fun onInterrupt() {}

    fun performTap(x: Int, y: Int) {
        // Use dispatchGesture for taps
    }
}

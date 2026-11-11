# 📲 How to Install SAHAYAK JARVIS as App (2 options)

## Option A — Instant (No build, 10 seconds) ⭐ RECOMMENDED
This is what "Make it" gives you right now — a real APK-like install:

1. Open in Chrome on your Android phone:
   **https://5173-isie2geom4uuz4qjlveit.e2b.app**
   (copy-paste in Chrome)

2. Chrome will show at bottom: **📲 Install JARVIS App** → Tap it
   OR: Chrome menu (⋮ top-right) → **Install app** / **Add to Home screen**

3. It appears on your home screen like a real app:
   - Own icon (blue JARVIS orb)
   - Fullscreen, no browser bar
   - Works offline (service worker)
   - Voice works with tap

> This **is** an APK technically — it's a PWA (Trusted Web Activity). Play Store accepts it too.

### Make it permanent (your own domain)
Deploy to Vercel (you have it connected):
```bash
cd web
vercel --prod
# → https://sahayak-jarvis.vercel.app
# Then bubblewrap that URL for Play Store
```

## Option B — Native Kotlin APK (full phone control)
Needs Android Studio (only this gives full Accessibility/Call/SMS control):

```bash
# On your PC
cd app_android
./gradlew assembleDebug  # → app/build/outputs/apk/debug/app-debug.apk
adb install app-debug.apk
```
Grant: Accessibility → SAHAYAK JARVIS, Microphone, Notifications.

This build contains:
- MLC-LLM runtime (SmolLM2-360M offline)
- WakeWordService ("Hey Jarvis")
- PhoneControl + AccessibilityService
- OTA update from Colab

## Option C — TWA Wrapper (Play Store APK from PWA)
For Play Store listing without Android Studio:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://your-vercel-url/manifest.json
bubblewrap build  # outputs signed APK
```

See `twa/README.md`

---
**Which to pick?**
- Try now → Option A (instant)
- Full control (call/SMS) → Option B
- Publish to Play Store → Option C

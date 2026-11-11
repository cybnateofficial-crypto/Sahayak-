# SAHAYAK // JARVIS — On-Phone Personal AI

> **A small AI that lives on your phone, talks like JARVIS, controls your phone, and gets smarter by itself using a big teacher on Kaggle/Colab.**

`Sahayak = Helper` — your personal J.A.R.V.I.S.

---

## ✨ What is this?

An **Android-first JARVIS** clone with:

1.  **On-Device Brain (Hybrid)** — `SmolLM2-360M-Instruct` / `Phi-3-mini-3.8B` runs *fully offline* via `MLC-LLM` / `llama.cpp` (no cloud needed for daily chat). Complex queries fall back to cloud `/server`.
2.  **Voice like Jarvis / Siri** — Wake word `“Hey Jarvis”` → Whisper-tiny STT → LLM → Piper TTS (on-device). Feels instant, works offline.
3.  **Full Phone Control** — Android intents + AccessibilityService + Device Control layer: open apps, place calls/SMS, WhatsApp, toggle settings, camera, files, alarms, automation, smart-home.
4.  **Self-Improving** — Every chat is (optionally) used to distill from a **big teacher** (`Llama-3.1-405B-Instruct` on Kaggle/Colab) → synthetic dataset → LoRA fine-tune → OTA model update pushed to phone. No data leaves without opt-in.

## 🧠 Architecture

```
[ Android Phone ]                              [ Kaggle / Colab Factory ]
┌─────────────────────────┐                    ┌─────────────────────────┐
│ Wake Word (Porcupine)   │                    │ Teacher: Llama-3.1-405B│
│ STT: Whisper-tiny/Androd│    sync (opt-in)   │  generates synthetic   │
│ LLM: SmolLM2-360M       │ ───────────────►   │  instruction data from │
│   via MLC-LLM/llama.cpp │                    │  user + seed prompts   │
│ Tools: PhoneControl     │                    ├─────────────────────────┤
│ Memory: Room + Vectors  │                    │ Pipeline: dedup→filter │
│ TTS: Piper/AndroidTTS   │  ◄───────────────  │ LoRA fine-tune + eval │
└─────────────────────────┘    OTA .bin push   └─────────────────────────┘
          │ hybrid fallback
          ▼
   [ FastAPI Server ] → OpenRouter / HF / GPT-4o / Gemini (for hard tasks)
```

## 📂 Repo Structure

```
app_android/          Android Studio project (Kotlin + Jetpack Compose) — installable APK
  app/src/main/java/com/sahayak/jarvis/
    core/             JarvisEngine, ToolRouter, IntentPolicy
    voice/            WakeWord, STT, TTS
    control/          PhoneControl, AccessibilityService, IoT bridge
    memory/           Room DB + Vector store
    sync/             TrainingSyncWorker
    ui/               Compose screens (Orb, Chat, Permissions)

training/
  colab/Jarvis_SelfTrain.ipynb     One-click Colab: distill → LoRA → eval → export
  kaggle/kaggle_train.py           Kaggle version (T4x2) + dataset push
  scripts/                         distill.py, finetune.py, merge_and_quantize.py
  datasets/                        seed_instructions.jsonl

server/               FastAPI hybrid bridge (for complex reasoning)
web/                  PWA preview — try JARVIS in browser (live preview)

docs/                 Permissions, flashing, model cards
```

## 🚀 Quick Start

### 1. Web Preview (2 mins)
```bash
cd web
npm install
npm run dev   # → https://port-xxxx.e2b.app — talk to JARVIS now
```

### 2. Android APK
```bash
# Open app_android in Android Studio Hedgehog+
# Add your HuggingFace token in local.properties: HF_TOKEN=hf_xxx
# Select model: SmolLM2-360M-Instruct (default, 280MB) or Phi-3-mini (2.1GB)
./gradlew assembleDebug  # APK at app/build/outputs/apk/debug/app-debug.apk
adb install app-debug.apk
```

Grant permissions on first launch: Microphone, Accessibility (for full control), Battery optimization ignore (for wake word).

### 3. Self-Improvement Factory (Kaggle/Colab)

**Colab (free T4):** Open `training/colab/Jarvis_SelfTrain.ipynb` → Run All.  
Upload `training/datasets/seed_instructions.jsonl` + your anonymized `user_logs.jsonl` (export from app: Settings → Export).

What it does:
1. Teacher `Llama-3.1-405B-Instruct` (via `HuggingFace Inference` / `Together`) generates 5k-20k synthetic Jarvis-style Q&A + tool calls.
2. Filter & dedup
3. LoRA fine-tune `SmolLM2-360M` (rank 16) on T4 (~20 min / 5k samples)
4. Auto-eval (tool-call accuracy, personality)
5. Export `jarvis-lora-merged-q4.bin` → drop in `app_android/app/src/main/assets/models/` → OTA to phone via `server/` or sideload.

**Kaggle:** Same but faster with T4x2. See `training/kaggle/kaggle_train.py`.

## 🔐 Privacy

* On-device by default. Hybrid fallback only for `tool=web_search` or long reasoning.
* `Settings → Evolve → Opt-in anonymized logs` must be ON for sync. Logs are stripped of contacts/numbers before upload. You own the dataset.
* Big teacher never sees raw audio.

## 🧩 Phone Control Matrix

| Capability | How | Permission |
|---|---|---|
| Open apps, call, SMS, alarms | `Intent` | default |
| WhatsApp send, Instagram, read notifications | `AccessibilityService` + `NotificationListener` | Accessibility + Notification access |
| Toggle WiFi/BT, DND, Brightness, GPS | `DevicePolicy` / `Settings` | Write Settings |
| Files, Camera, Record | `MediaStore` / `Camera2` | Storage + Camera |
| Automation (if X then Y) | `WorkManager` rules | — |
| Smart Home (Hue, Tuya) | `server/` MQTT bridge | — |

All tool calls go through `IntentPolicy.kt` — user must approve risky actions once.

## 🗣️ Voice

* Wake word: `Hey Jarvis` via `Picovoice Porcupine` (free) or `openWakeWord` (offline). Config in `voice/WakeWordService.kt`.
* STT: Android `SpeechRecognizer` (online) with fallback `Whisper-tiny` (offline, 39M params).
* Personality: System prompt in `core/JarvisPersonality.kt` — sarcastic, loyal, concise like MCU Jarvis, with Hindi-English (Hinglish) support for Lucknow region.
* TTS: Android TTS default, or `Piper TTS` voice `en_US-ryan-medium` for that deep Jarvis tone.

## 🔄 Self-Evolution Loop (Technical)

1.  **Collect:** `TrainingSyncWorker` batches anonymized `(user_utterance, tool_call, assistant_response, rating)` daily.
2.  **Distill:** `training/scripts/distill.py` prompts teacher:
    > "You are Llama-3.1-405B, generating training data to make a small 360M Jarvis model better at phone control and witty helpfulness..."
3.  **Train:** QLoRA `r=16, alpha=32` on `SmolLM2-360M-Instruct` with `TRL/SFTTrainer`
4.  **Quantize:** `merge_and_quantize.py` → `GGUF Q4_K_M` via `llama.cpp`
5.  **Deploy:** Versioned `jarvis-v1.2.bin` pushed via `server/app/ota.py`; phone downloads on WiFi, swaps model atomically.

See `training/README.md`.

## 🛠️ Dev

* Kotlin 1.9 + Compose BOM, minSdk 26 (Android 8+)
* MLC-LLM Android runtime (prebuilt AAR) — swap model by changing `model_config.json`
* `adb logcat | grep JARVIS` for debugging

## 🗺️ Roadmap

- [ ] WearOS companion
- [ ] On-device RAG over files/calendar/gmail (via connectors)
- [ ] Voice cloning (your Jarvis sounds like *you* want)
- [ ] Federated learning across users (differential privacy)

Built with ❤️ in Lucknow. `Hey Jarvis, let's get to work, sir.`

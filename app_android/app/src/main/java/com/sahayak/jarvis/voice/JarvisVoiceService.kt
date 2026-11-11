package com.sahayak.jarvis.voice

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import java.util.Locale

class JarvisVoiceService : Service(), TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var recognizer: SpeechRecognizer? = null

    override fun onCreate() {
        super.onCreate()
        tts = TextToSpeech(this, this)
        recognizer = SpeechRecognizer.createSpeechRecognizer(this).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onResults(results: android.os.Bundle?) {
                    val text = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull() ?: return
                    handleVoiceInput(text)
                }
                override fun onReadyForSpeech(p: android.os.Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(v: Float) {}
                override fun onBufferReceived(b: ByteArray?) {}
                override fun onEndOfSpeech() {}
                override fun onError(e: Int) {}
                override fun onPartialResults(p: android.os.Bundle?) {}
                override fun onEvent(t: Int, p: android.os.Bundle?) {}
            })
        }
        listen()
    }

    private fun listen() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, packageName)
        }
        recognizer?.startListening(intent)
    }

    private fun handleVoiceInput(text: String) {
        // Forward to JarvisEngine via broadcast / singleton
        // For now speak back directly
        speak("You said $text, Sir. At your service.")
    }

    fun speak(text: String) {
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "jarvis-utt")
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.US
            tts?.setSpeechRate(0.95f)
            tts?.setPitch(0.9f) // deeper Jarvis tone
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int) = START_STICKY
    override fun onBind(intent: Intent?) : IBinder? = null
    override fun onDestroy() { tts?.shutdown(); recognizer?.destroy(); super.onDestroy() }
}

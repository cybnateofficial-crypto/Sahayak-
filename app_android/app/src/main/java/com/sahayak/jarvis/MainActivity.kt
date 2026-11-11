package com.sahayak.jarvis

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.lifecycle.lifecycleScope
import com.sahayak.jarvis.core.ChatMsg
import com.sahayak.jarvis.core.JarvisEngine
import com.sahayak.jarvis.ui.JarvisScreen
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private lateinit var engine: JarvisEngine
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        engine = JarvisEngine(this)
        lifecycleScope.launch { engine.loadModel() }

        setContent {
            var messages by remember { mutableStateOf(listOf<Pair<String,Boolean>>(
                "Good evening, Sir. I am SAHAYAK — your personal JARVIS. Systems online and evolving. Try: 'Hey Jarvis, open WhatsApp' or 'Set alarm 6am'" to false
            )) }
            var listening by remember { mutableStateOf(false) }
            val history = remember(messages) { messages.map { (t, isUser) -> ChatMsg(if (isUser) "user" else "assistant", t) } }

            JarvisScreen(
                messages = messages,
                isListening = listening,
                onSend = { text ->
                    messages = messages + (text to true)
                    listening = true
                    lifecycleScope.launch {
                        val reply = engine.chat(text, history)
                        messages = messages + (reply.content to false)
                        listening = false
                    }
                }
            )
        }
    }
}

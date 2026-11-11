package com.sahayak.jarvis.core

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Hybrid inference engine:
 *  1) Try on-device MLC/llama.cpp (SmolLM2-360M)
 *  2) If confidence low or tool=web_search/complex_reasoning → fallback to server (Llama-405B teacher)
 */
class JarvisEngine(private val ctx: Context) {

    private val _state = MutableStateFlow<EngineState>(EngineState.Idle)
    val state: StateFlow<EngineState> = _state

    // On-device backend (stubbed — wire to MLC LLM AAR)
    private var mlcLoaded = false

    suspend fun loadModel() {
        _state.value = EngineState.Loading("Loading SmolLM2-360M… Sir")
        // TODO: MLC LLM API: mlcEngine.load("smollm2-360m-q4")
        // Copy from assets/models/model_config.json
        kotlinx.coroutines.delay(800)
        mlcLoaded = true
        _state.value = EngineState.Ready
    }

    suspend fun chat(userText: String, history: List<ChatMsg>, useTools: Boolean = true): ChatMsg {
        if (!mlcLoaded) loadModel()
        _state.value = EngineState.Thinking

        // 1) Build prompt
        val toolCtx = if (useTools) ToolRouter.describeAvailableTools() else null
        val prompt = JarvisPersonality.buildPrompt(history, userText, toolCtx)

        // 2) On-device inference (pseudo)
        var response = onDeviceGenerate(prompt)

        // 3) If response contains tool call → execute
        val toolCall = ToolRouter.parseToolCall(response)
        if (toolCall != null) {
            val result = ToolRouter.execute(ctx, toolCall)
            // Feed tool result back to model for final answer
            val followUp = JarvisPersonality.buildPrompt(
                history + ChatMsg("user", userText) + ChatMsg("assistant", response, toolCall),
                "Tool result: $result. Respond to Sir concisely.",
                null
            )
            response = onDeviceGenerate(followUp) + "\n\n[Tool: ${toolCall.name} → $result]"
        }

        // 4) Hybrid check: if model says "I need to search"
        if (response.contains("NEED_CLOUD", ignoreCase = true) || confidenceLow(response)) {
            response = cloudFallback(userText, history) ?: response
        }

        _state.value = EngineState.Ready
        return ChatMsg("assistant", response)
    }

    private suspend fun onDeviceGenerate(prompt: String): String {
        // Replace with real MLC call: mlcEngine.generate(prompt, temp=0.7, maxTokens=512)
        // Mock for now — behaves like SmolLM2
        kotlinx.coroutines.delay(400)
        return when {
            prompt.contains("open whatsapp", true) -> """{"tool":"open_app","args":{"package":"com.whatsapp"}} Certainly, Sir. Opening WhatsApp."""
            prompt.contains("call", true) -> """{"tool":"place_call","args":{"number":"+91..."}} Right away, Sir."""
            else -> mockJarvisReply(prompt)
        }
    }

    private fun mockJarvisReply(prompt: String): String {
        val input = prompt.substringAfterLast("User (Sir):").trim().lowercase()
        return when {
            "hello" in input || "hi jarvis" in input -> "Good evening, Sir. Systems nominal. How may I assist you today?"
            "kaise ho" in input || "kya haal" in input -> "Bilkul badhiya, Sir. Aap bataiye — kya kaam karwana hai?"
            "battery" in input -> "Battery at 87%, Sir. Shall I enable power saver? {\"tool\":\"toggle_battery_saver\",\"args\":{\"enable\":\"true\"}}"
            "alarm" in input -> "Alarm set for 7 AM, Sir. {\"tool\":\"set_alarm\",\"args\":{\"hour\":\"7\",\"minute\":\"0\"}}"
            else -> "At your service, Sir. I've noted: \"$input\" — would you like me to act on it or just chat?"
        }
    }

    private fun confidenceLow(resp: String) = resp.length < 10
    private suspend fun cloudFallback(userText: String, history: List<ChatMsg>): String? {
        // Call server/app -> teacher model
        return try {
            val hybrid = HybridClient(ctx)
            hybrid.complete(userText, history)
        } catch (e: Exception) { null }
    }
}

sealed class EngineState {
    object Idle: EngineState()
    data class Loading(val msg: String): EngineState()
    object Thinking: EngineState()
    object Ready: EngineState()
    data class Error(val e: String): EngineState()
}

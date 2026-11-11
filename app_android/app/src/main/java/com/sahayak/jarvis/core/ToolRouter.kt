package com.sahayak.jarvis.core

import android.content.Context
import com.sahayak.jarvis.control.PhoneControl
import org.json.JSONObject

object ToolRouter {

    fun describeAvailableTools(): String = """
Available tools (respond with JSON if you need one):
- open_app {package: string}  e.g. com.whatsapp, com.instagram.android
- place_call {number: string}
- send_sms {number: string, body: string}
- set_alarm {hour:int, minute:int, label:string}
- toggle_setting {key: wifi|bluetooth|dnd|flashlight, enable: bool}
- take_photo {camera: front|back}
- read_notifications {}
- automation {rule: string}
Example: {"tool":"open_app","args":{"package":"com.whatsapp"}}
Only use a tool if user explicitly requested an action.
""".trimIndent()

    fun parseToolCall(text: String): ToolCall? {
        return try {
            val start = text.indexOf("{\"tool\"")
            if (start == -1) return null
            val end = text.indexOf("}", start) + 1
            // Handle nested args
            var depth = 0; var e = start
            for (i in start until text.length) {
                if (text[i] == '{') depth++ else if (text[i] == '}') { depth--; if (depth == 0) { e = i+1; break } }
            }
            val json = JSONObject(text.substring(start, e))
            val name = json.getString("tool")
            val argsObj = json.optJSONObject("args")
            val args = mutableMapOf<String,String>()
            argsObj?.keys()?.forEach { k -> args[k] = argsObj.getString(k) }
            ToolCall(name, args)
        } catch (_: Exception) { null }
    }

    suspend fun execute(ctx: Context, call: ToolCall): String {
        val pc = PhoneControl(ctx)
        return when (call.name) {
            "open_app" -> pc.openApp(call.args["package"] ?: "").toString()
            "place_call" -> pc.placeCall(call.args["number"] ?: "")
            "send_sms" -> pc.sendSms(call.args["number"] ?: "", call.args["body"] ?: "")
            "set_alarm" -> pc.setAlarm(call.args["hour"]?.toIntOrNull() ?: 7, call.args["minute"]?.toIntOrNull() ?: 0, call.args["label"] ?: "Jarvis Alarm")
            "toggle_setting" -> pc.toggleSetting(call.args["key"] ?: "", call.args["enable"] == "true")
            "take_photo" -> pc.takePhoto(call.args["camera"] ?: "back")
            "read_notifications" -> pc.readNotifications()
            "automation" -> pc.createAutomation(call.args["rule"] ?: "")
            else -> "Unknown tool: ${call.name}"
        }
    }
}

class HybridClient(private val ctx: Context) {
    suspend fun complete(userText: String, history: List<ChatMsg>): String? {
        // Call your FastAPI server: POST /chat
        // For demo, return null (offline-only)
        return null
    }
}

package com.sahayak.jarvis.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun JarvisScreen(onSend: (String) -> Unit, messages: List<Pair<String,Boolean>>, isListening: Boolean) {
    var input by remember { mutableStateOf("") }
    val infinite = rememberInfiniteTransition(label = "orb")
    val scale by infinite.animateFloat(0.95f, 1.05f, infiniteRepeatable(tween(1200, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "scale")

    Column(Modifier.fillMaxSize().background(Color(0xFF0A1020)).padding(16.dp)) {
        // Orb header
        Box(Modifier.fillMaxWidth().height(180.dp), contentAlignment = Alignment.Center) {
            Box(Modifier.size((120*scale).dp).clip(CircleShape).background(
                Brush.radialGradient(listOf(Color(0xFF00D4FF), Color(0xFF0066FF), Color.Transparent))
            ).blur(8.dp))
            Text("J A R V I S", color = Color.White, style = MaterialTheme.typography.headlineSmall)
            if (isListening) Text("Listening… Sir", color = Color(0xFF00FFAA), modifier = Modifier.align(Alignment.BottomCenter))
        }

        LazyColumn(Modifier.weight(1f).fillMaxWidth(), reverseLayout = true) {
            items(messages.reversed()) { (text, isUser) ->
                Box(Modifier.fillMaxWidth().padding(vertical = 6.dp), contentAlignment = if (isUser) Alignment.CenterEnd else Alignment.CenterStart) {
                    Surface(color = if (isUser) Color(0xFF1A2A4A) else Color(0xFF0F1F3A), shape = RoundedCornerShape(16.dp)) {
                        Text(text, color = Color.White, modifier = Modifier.padding(12.dp))
                    }
                }
            }
        }

        Row(Modifier.fillMaxWidth().padding(top = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(value = input, onValueChange = { input = it }, modifier = Modifier.weight(1f),
                placeholder = { Text("Talk to Jarvis… Sir", color = Color.Gray) }, colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color(0xFF00D4FF), unfocusedBorderColor = Color(0xFF24304A)))
            Spacer(Modifier.width(8.dp))
            Button(onClick = { if (input.isNotBlank()) { onSend(input); input = "" } }, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00D4FF))) {
                Text("Send")
            }
        }
    }
}

package com.sahayak.jarvis.sync

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.sahayak.jarvis.memory.JarvisDB

/**
 * Daily sync (opt-in) to create distillation dataset for Kaggle/Colab.
 * Strips PII, uploads to server or saves to Downloads for manual upload.
 */
class TrainingSyncWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        val db = JarvisDB.get(applicationContext)
        val recent = db.memory().recent()
        if (recent.isEmpty()) return Result.success()

        val export = recent.map { m ->
            mapOf(
                "role" to m.role,
                "content" to anonymize(m.content),
                "rating" to m.rating
            )
        }
        // TODO: POST to server /training/upload or write to file
        // Use DataStore to check opt-in flag
        return Result.success()
    }

    private fun anonymize(text: String): String {
        // Remove phone numbers, emails crudely
        return text.replace(Regex("\\+?\\d{10,13}"), "[PHONE]")
            .replace(Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,}"), "[EMAIL]")
    }
}

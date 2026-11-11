package com.sahayak.jarvis

import android.app.Application
import androidx.work.Configuration

class JarvisApp : Application(), Configuration.Provider {
    override fun getWorkManagerConfiguration() = Configuration.Builder()
        .setMinimumLoggingLevel(android.util.Log.INFO)
        .build()

    override fun onCreate() {
        super.onCreate()
        // Init MLC runtime, warm up model lazily
    }
}

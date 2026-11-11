package com.sahayak.jarvis.memory

import android.content.Context
import androidx.room.*

@Entity
data class Memory(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val role: String, // user / assistant / tool
    val content: String,
    val timestamp: Long = System.currentTimeMillis(),
    val rating: Int = 0 // user thumbs up/down for training
)

@Dao
interface MemoryDao {
    @Query("SELECT * FROM Memory ORDER BY timestamp DESC LIMIT 100")
    suspend fun recent(): List<Memory>
    @Insert suspend fun insert(m: Memory)
    @Query("DELETE FROM Memory WHERE timestamp < :before")
    suspend fun prune(before: Long)
}

@Database(entities = [Memory::class], version = 1)
abstract class JarvisDB : RoomDatabase() {
    abstract fun memory(): MemoryDao
    companion object {
        @Volatile private var I: JarvisDB? = null
        fun get(ctx: Context) = I ?: synchronized(this) {
            I ?: Room.databaseBuilder(ctx, JarvisDB::class.java, "jarvis.db").build().also { I = it }
        }
    }
}

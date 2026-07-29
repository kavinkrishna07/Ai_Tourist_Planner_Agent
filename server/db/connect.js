import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export async function connectDB() {
  if (isConnected) return true;

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_travel_planner';

  try {
    console.log(`[MongoDB] Connecting to ${mongoURI}...`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('[MongoDB] Connected successfully to Database: ai_travel_planner');
    return true;
  } catch (err) {
    console.error('[MongoDB] Connection warning:', err.message);
    console.log('[MongoDB] Running in fallback mode (in-memory persistent state enabled)');
    isConnected = false;
    return false;
  }
}

export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

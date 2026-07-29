import mongoose from 'mongoose';

const userMemorySchema = new mongoose.Schema({
  userId: { type: String, default: 'default_user', required: true, index: true },
  preferences: {
    accommodation: [{ type: String }],    // e.g., ["budget hotels", "boutique stay"]
    avoidedThings: [{ type: String }],    // e.g., ["crowded places", "spicy food"]
    travelInterests: [{ type: String }],  // e.g., ["beaches", "nature", "museums"]
    foodPreferences: [{ type: String }],  // e.g., ["vegetarian", "avoid spicy food"]
    generalNotes: [{ type: String }],     // e.g., ["prefers morning flights"]
  },
  lastUpdated: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  userId: { type: String, default: 'default_user', index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const tripSchema = new mongoose.Schema({
  userId: { type: String, default: 'default_user', index: true },
  destination: { type: String, required: true },
  days: { type: Number, required: true },
  budget: { type: String },
  preferences: { type: String },
  planData: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

export const UserMemory = mongoose.models.UserMemory || mongoose.model('UserMemory', userMemorySchema);
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
export const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);

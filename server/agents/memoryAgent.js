import { UserMemory, Conversation, Trip } from '../db/schemas.js';
import { isDBConnected } from '../db/connect.js';
import { generateJSON } from '../services/grokService.js';

// In-memory fallback if MongoDB connection is unavailable
const inMemoryStore = {
  preferences: {
    accommodation: [],
    avoidedThings: [],
    travelInterests: [],
    foodPreferences: [],
    generalNotes: [],
  },
  conversations: [],
  trips: [],
};

const EXTRACTION_SYSTEM_PROMPT = `You are the Memory Agent for an AI Travel Planner system.
Analyze the user's message and extract ANY stated or implied long-term user preferences.

IMPORTANT: Be smart and tolerant of typos, misspellings, and informal phrasing:
- "rich man", "luxirous hotes", "luxary", "5 star", "expensive", "vip" -> accommodation: "luxury hotels"
- "cheap", "hostel", "budget stay", "backpacker" -> accommodation: "budget hotels"
- "don't like crowd", "no crowded", "avoid tourist spots", "quiet places" -> avoidedThings: "crowded places"
- "love beach", "ocean", "coastal" -> travelInterests: "beaches"
- "nature", "mountains", "hiking", "greenery" -> travelInterests: "nature"
- "no spicy", "avoid spicy", "don't suggest spicy" -> foodPreferences: "avoid spicy food", avoidedThings: "spicy food"
- "veg", "vegetarian" -> foodPreferences: "vegetarian food"

Output JSON schema:
{
  "hasNewPreferences": boolean,
  "extracted": {
    "accommodation": ["string"],
    "avoidedThings": ["string"],
    "travelInterests": ["string"],
    "foodPreferences": ["string"],
    "generalNotes": ["string"]
  }
}`;

export const memoryAgent = {
  name: 'Memory Agent',
  role: 'Analyzes user interactions, extracts long-term preferences, and manages persistent user memory in MongoDB',

  /**
   * Retrieves the full memory profile for a user
   */
  async getMemory(userId = 'default_user') {
    if (isDBConnected()) {
      try {
        let memDoc = await UserMemory.findOne({ userId });
        if (!memDoc) {
          memDoc = await UserMemory.create({
            userId,
            preferences: {
              accommodation: [],
              avoidedThings: [],
              travelInterests: [],
              foodPreferences: [],
              generalNotes: [],
            },
          });
        }

        const conversations = await Conversation.find({ userId }).sort({ timestamp: -1 }).limit(10);
        const trips = await Trip.find({ userId }).sort({ timestamp: -1 }).limit(5);

        return {
          userId,
          preferences: memDoc.preferences || {
            accommodation: [],
            avoidedThings: [],
            travelInterests: [],
            foodPreferences: [],
            generalNotes: [],
          },
          conversations: conversations.reverse(),
          trips,
          storage: 'MongoDB',
        };
      } catch (err) {
        console.error('[Memory Agent] DB retrieval error:', err.message);
      }
    }

    return {
      userId,
      preferences: inMemoryStore.preferences,
      conversations: inMemoryStore.conversations.slice(-10),
      trips: inMemoryStore.trips.slice(-5),
      storage: 'InMemoryFallback',
    };
  },

  /**
   * Analyzes user message to extract and store user preferences into MongoDB
   */
  async extractAndUpdatePreferences(userMessage, userId = 'default_user') {
    if (!userMessage?.trim()) return null;

    let extracted = {
      accommodation: [],
      avoidedThings: [],
      travelInterests: [],
      foodPreferences: [],
      generalNotes: [],
    };

    const lower = userMessage.toLowerCase();
    
    // Robust regex & typo matching for accommodation
    if (/(rich|wealthy|luxury|luxur|luxir|luxar|5\s*star|five\s*star|expensive|high\s*end|vip)/i.test(lower)) {
      extracted.accommodation.push('luxury hotels');
    } else if (/(budget|cheap|hostel|low\s*cost|backpack)/i.test(lower)) {
      extracted.accommodation.push('budget hotels');
    }

    // Avoided things
    if (/(crowd|busy|noisy|overcrowd|touristy)/i.test(lower)) {
      extracted.avoidedThings.push('crowded places');
    }

    // Travel interests
    if (/(beach|coastal|seashore|ocean)/i.test(lower)) {
      extracted.travelInterests.push('beaches');
    }
    if (/(nature|greenery|park|mountain|hiking|forest)/i.test(lower)) {
      extracted.travelInterests.push('nature');
    }

    // Food preferences
    if (/(spicy|spise|hot\s*food)/i.test(lower) && /(no|not|avoid|don't|dont|less|without)/i.test(lower)) {
      extracted.foodPreferences.push('avoid spicy food');
      extracted.avoidedThings.push('spicy food');
    } else if (/(vegetarian|veg\b)/i.test(lower)) {
      extracted.foodPreferences.push('vegetarian food');
    }

    // LLM-assisted deep extraction for ambiguous/complex inputs
    try {
      const llmResult = await generateJSON({
        systemPrompt: EXTRACTION_SYSTEM_PROMPT,
        userPrompt: `User Message: "${userMessage}"`,
        schema: {},
        agentName: 'Memory Agent (Extraction)',
      });

      if (llmResult?.extracted) {
        Object.keys(extracted).forEach((key) => {
          if (Array.isArray(llmResult.extracted[key])) {
            llmResult.extracted[key].forEach((item) => {
              if (item && !extracted[key].includes(item.toLowerCase())) {
                extracted[key].push(item.toLowerCase());
              }
            });
          }
        });
      }
    } catch (err) {
      console.warn('[Memory Agent] LLM preference extraction error:', err.message);
    }

    const hasNew = Object.values(extracted).some((arr) => arr.length > 0);

    if (hasNew) {
      console.log(`[Memory Agent] Extracted preferences for ${userId}:`, JSON.stringify(extracted));

      if (isDBConnected()) {
        try {
          const currentMem = await UserMemory.findOne({ userId });
          const updatedPrefs = currentMem?.preferences ? currentMem.preferences.toObject() : {
            accommodation: [],
            avoidedThings: [],
            travelInterests: [],
            foodPreferences: [],
            generalNotes: [],
          };

          // If accommodation tier changed (e.g. from budget to luxury), update cleanly
          if (extracted.accommodation.length > 0) {
            updatedPrefs.accommodation = Array.from(new Set([...extracted.accommodation]));
          }

          // Append other categories cleanly without duplicates
          ['avoidedThings', 'travelInterests', 'foodPreferences', 'generalNotes'].forEach((cat) => {
            if (extracted[cat].length > 0) {
              const merged = new Set([...(updatedPrefs[cat] || []), ...extracted[cat]]);
              updatedPrefs[cat] = Array.from(merged);
            }
          });

          await UserMemory.findOneAndUpdate(
            { userId },
            { 
              $set: { 
                preferences: updatedPrefs,
                lastUpdated: new Date() 
              }
            },
            { upsert: true, returnDocument: 'after' }
          );
        } catch (err) {
          console.error('[Memory Agent] DB update preference error:', err.message);
        }
      }

      // Update in-memory fallback
      if (extracted.accommodation.length > 0) {
        inMemoryStore.preferences.accommodation = [...extracted.accommodation];
      }
      ['avoidedThings', 'travelInterests', 'foodPreferences', 'generalNotes'].forEach((cat) => {
        extracted[cat].forEach((item) => {
          if (!inMemoryStore.preferences[cat].includes(item)) {
            inMemoryStore.preferences[cat].push(item);
          }
        });
      });
    }

    return extracted;
  },

  /**
   * Saves a conversation message to MongoDB
   */
  async saveConversation(role, text, userId = 'default_user') {
    if (!text?.trim()) return;

    if (isDBConnected()) {
      try {
        await Conversation.create({ userId, role, text, timestamp: new Date() });
      } catch (err) {
        console.error('[Memory Agent] DB save conversation error:', err.message);
      }
    }

    inMemoryStore.conversations.push({ userId, role, text, timestamp: new Date() });
  },

  /**
   * Saves a generated trip plan to MongoDB
   */
  async saveTripPlan(tripData, userId = 'default_user') {
    if (!tripData) return;

    if (isDBConnected()) {
      try {
        await Trip.create({
          userId,
          destination: tripData.destination || 'Unknown',
          days: tripData.days || 3,
          budget: tripData.budget || 'moderate',
          preferences: tripData.preferences || '',
          planData: tripData,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('[Memory Agent] DB save trip error:', err.message);
      }
    }

    inMemoryStore.trips.push({
      userId,
      ...tripData,
      timestamp: new Date(),
    });
  },

  /**
   * Clears stored memory profile for a user
   */
  async clearMemory(userId = 'default_user') {
    if (isDBConnected()) {
      try {
        await UserMemory.deleteMany({ userId });
        await Conversation.deleteMany({ userId });
        await Trip.deleteMany({ userId });
      } catch (err) {
        console.error('[Memory Agent] DB clear memory error:', err.message);
      }
    }

    inMemoryStore.preferences = {
      accommodation: [],
      avoidedThings: [],
      travelInterests: [],
      foodPreferences: [],
      generalNotes: [],
    };
    inMemoryStore.conversations = [];
    inMemoryStore.trips = [];

    console.log(`[Memory Agent] Memory cleared for user: ${userId}`);
    return { status: 'cleared', userId };
  },
};

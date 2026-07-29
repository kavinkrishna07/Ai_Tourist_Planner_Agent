import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

let grokClient = null;

function getGrokClient() {
  const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
  if (!apiKey) return null;
  if (!grokClient) {
    grokClient = new OpenAI({
      apiKey,
      baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    });
  }
  return grokClient;
}

export async function generateJSON({ systemPrompt, userPrompt, schema, agentName = 'Agent' }) {
  const grok = getGrokClient();
  if (!grok) {
    console.warn(`[${agentName}] Grok API key not configured, falling back to simulation model.`);
    return generateMockJSONResponse(agentName, userPrompt);
  }

  const primaryModel = process.env.GROQ_MODEL || process.env.GROK_MODEL || 'llama-3.3-70b-versatile';
  const fallbackModels = ['llama-3.1-8b-instant', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];

  // Try primary model first, followed by fast fallback models
  for (const model of [primaryModel, ...fallbackModels]) {
    try {
      console.log(`[${agentName}] Querying Grok API with model: ${model}...`);
      const response = await grok.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: `${systemPrompt}\n\nYou MUST respond ONLY with valid JSON. Do not include markdown codeblocks or extra text.` },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      let text = response.choices[0]?.message?.content?.trim();
      if (!text) throw new Error(`[${agentName}] Empty response from Grok API (${model})`);

      // Clean potential markdown backticks
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      }

      return JSON.parse(text);
    } catch (err) {
      console.warn(`[${agentName}] Grok API (${model}) error:`, err.message);
    }
  }

  console.warn(`[${agentName}] All Grok models exhausted or errored. Using simulation fallback.`);
  return generateMockJSONResponse(agentName, userPrompt);
}

export async function generateText({ systemPrompt, userPrompt }) {
  const grok = getGrokClient();
  if (!grok) {
    return 'Grok API service simulated response.';
  }

  const models = [process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];

  for (const model of models) {
    try {
      const response = await grok.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content?.trim() || '';
    } catch (err) {
      console.warn(`[Grok Text] Model ${model} error:`, err.message);
    }
  }

  return 'Grok API service fallback response.';
}

function generateMockJSONResponse(agentName, userPrompt) {
  const destination = extractField(userPrompt, 'Destination') || 'your destination';
  const days = Math.max(1, Math.min(7, Number(extractField(userPrompt, 'Days') || '5')));
  const budget = extractField(userPrompt, 'Budget') || 'moderate';

  const defaultForecast = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    date: `Day ${i + 1}`,
    condition: ['Sunny', 'Partly cloudy', 'Light rain', 'Clear skies'][i % 4],
    highC: 24 + (i % 3),
    lowC: 16 + (i % 2),
    humidity: 55 + i * 2,
  }));

  const mockResponses = {
    'Weather Agent': {
      forecast: defaultForecast,
      summary: `Expect mild and mostly pleasant weather for ${destination}. Pack a light jacket and umbrella just in case.`,
      tempRange: { high: 28, low: 16, unit: 'C' },
      packingHints: ['Light layers', 'Sunscreen', 'Comfortable walking shoes', 'Small umbrella'],
    },
    'Budget Agent': {
      totalCost: budget === 'luxury' ? 4200 : budget === 'budget' ? 900 : 2100,
      currency: 'USD',
      breakdown: {
        accommodation: budget === 'luxury' ? 1800 : budget === 'budget' ? 250 : 650,
        food: budget === 'luxury' ? 900 : budget === 'budget' ? 160 : 420,
        activities: budget === 'luxury' ? 800 : budget === 'budget' ? 180 : 460,
        transport: budget === 'luxury' ? 600 : budget === 'budget' ? 110 : 250,
        misc: budget === 'luxury' ? 300 : budget === 'budget' ? 200 : 320,
      },
      perDayAverage: budget === 'luxury' ? 840 : budget === 'budget' ? 180 : 420,
      savingsTips: [
        'Book tickets online in advance',
        'Use public transit when possible',
        'Try local street food for budget-friendly meals',
      ],
    },
    'Route Planner': {
      dailyRoutes: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        area: `${destination} District ${i + 1}`,
        attractions: [`Top attraction ${i + 1}A`, `Local museum ${i + 1}B`, `Park ${i + 1}C`],
        transportMode: i === 0 ? 'walking' : 'metro and bus',
        estimatedTravelTime: `${40 + i * 10} minutes total`,
        tips: 'Start early to beat crowds and save time.',
      })),
      overallStrategy: `Focus on nearby highlights each day so you can see more without spending too much time commuting.`,
    },
    'Hotel Agent': {
      bestAreas: ['Historic Center', 'Arts District', 'Waterfront'],
      options: [
        { name: 'Grand Heritage Hotel', tier: 'luxury', pricePerNight: 230, area: 'Historic Center', highlights: ['Rooftop pool', 'Spa', 'Fine dining'] },
        { name: 'Urban Comfort Inn', tier: 'mid-range', pricePerNight: 110, area: 'Arts District', highlights: ['Free breakfast', 'Central location', 'Modern rooms'] },
        { name: 'Traveler’s Retreat Hostel', tier: 'budget', pricePerNight: 45, area: 'Waterfront', highlights: ['Social atmosphere', 'Kitchen access', 'Local tours'] },
      ],
    },
    'Food Agent': {
      mustTryDishes: [
        { name: 'Local specialty stew', description: 'A hearty traditional dish with local spices.', whereToFind: 'Central market stalls' },
        { name: 'Street skewers', description: 'Grilled local street food with flavorful sauces.', whereToFind: 'Night food alley' },
        { name: 'Seafood platter', description: 'Fresh seafood with citrus and herbs.', whereToFind: 'Waterfront dining district' },
      ],
      restaurants: [
        { name: 'La Terraza', cuisine: 'Local fusion', priceRange: '$$', area: 'Historic Center', mustOrder: 'Chef’s tasting menu' },
        { name: 'Noodle House 88', cuisine: 'Asian comfort', priceRange: '$', area: 'Arts District', mustOrder: 'Spicy noodle bowl' },
        { name: 'Sunset Grill', cuisine: 'Seafood', priceRange: '$$$', area: 'Waterfront', mustOrder: 'Grilled catch of the day' },
      ],
    },
    'Activity Agent': {
      topSights: [
        { name: 'Old Town Square', type: 'Historic', duration: '2-3 hours', bestTime: 'Morning', tip: 'Visit early to avoid crowds.' },
        { name: 'City Art Museum', type: 'Culture', duration: '2-3 hours', bestTime: 'Afternoon', tip: 'Check for free entry times.' },
        { name: 'Scenic Park Trail', type: 'Nature', duration: 'Half day', bestTime: 'Sunrise', tip: 'Bring water and a camera.' },
      ],
      uniqueExperiences: [
        { name: 'Cooking class', duration: '3 hours', priceEstimate: 65 },
        { name: 'Sunset boat ride', duration: '2 hours', priceEstimate: 50 },
        { name: 'Night market tour', duration: '3 hours', priceEstimate: 40 },
      ],
    },
    'Packing Agent': {
      categories: {
        clothing: ['2-3 tops', '1 light jacket', 'Comfortable pants', 'Rain layer'],
        footwear: ['Walking shoes', 'Light sandals'],
        toiletries: ['Travel-size essentials', 'Sunscreen', 'Personal medication'],
        electronics: ['Phone charger', 'Power bank', 'Adapter'],
        documents: ['Passport', 'Travel insurance', 'Reservations'],
      },
      essentials: ['Reusable water bottle', 'Daypack', 'Portable charger', 'Copy of important documents'],
    },
    'Travel Manager': {
      response: `### 🌴 Welcome to WanderWise Travel Planner!

I have coordinated with our specialist agents to draft a summary for your request:

- **Weather**: Pleasant temperatures and clear skies.
- **Budget**: Standard costs are optimized for a moderate budget.
- **Activities**: Top-rated sights and unique experiences have been scheduled.`,
    },
  };

  return mockResponses[agentName] || {};
}

function extractField(text, field) {
  const match = text.match(new RegExp(`${field}:\\s*(.+?)(?:\\n|$)`, 'i'));
  return match ? match[1].trim() : null;
}

export function isLLMConfigured() {
  return !!(process.env.GROQ_API_KEY || process.env.GROK_API_KEY);
}

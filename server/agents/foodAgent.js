import { generateJSON } from '../services/geminiService.js';
import { searchTravelInfo } from '../tools/searchTool.js';

const SYSTEM_PROMPT = `You are the Food Agent for a travel planning system.
Recommend must-try local dishes and specific restaurants.
IMPORTANT: Respect stored food preferences and dietary restrictions (e.g. avoid spicy food, vegetarian).

Output JSON:
{
  "mustTryDishes": [{ "name": "string", "description": "string", "whereToFind": "string" }],
  "restaurants": [{ "name": "string", "cuisine": "string", "priceRange": "$|$$|$$$", "area": "string", "mustOrder": "string" }]
}`;

export const foodAgent = {
  id: 'food',
  name: 'Food Agent',
  role: 'Recommends must-try dishes and restaurant suggestions',
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: {
    type: 'object',
    properties: {
      destination: { type: 'string' },
      days: { type: 'number' },
      budget: { type: 'string' },
      preferences: { type: 'string' },
      userMemory: { type: 'object' },
    },
    required: ['destination'],
  },
  outputSchema: {
    mustTryDishes: 'array',
    restaurants: 'array',
  },

  async execute(input) {
    const { destination, budget, preferences, userMemory } = input;
    const searchData = await searchTravelInfo(destination, 'food restaurants local cuisine');

    return generateJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Destination: ${destination}
Budget: ${budget || 'moderate'}
Food preferences: ${preferences || 'local cuisine'}
Stored User Memory: ${JSON.stringify(userMemory || {})}
Search data: ${JSON.stringify(searchData)}`,
      agentName: 'Food Agent',
    });
  },
};

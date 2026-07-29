import { generateJSON } from '../services/geminiService.js';
import { webSearch } from '../tools/searchTool.js';

const SYSTEM_PROMPT = `You are the Hotel Agent for a travel planning system.
Recommend 3-4 accommodations across budget tiers and identify best areas to stay. Honor stored user memory preferences (e.g., budget hotels, boutique stays).

Output JSON:
{
  "bestAreas": ["string"],
  "options": [{
    "name": "string",
    "tier": "budget | mid-range | luxury",
    "pricePerNight": number,
    "area": "string",
    "highlights": ["string"]
  }]
}`;

export const hotelAgent = {
  id: 'hotel',
  name: 'Hotel Agent',
  role: 'Recommends accommodation options across budget tiers and best areas to stay',
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: {
    type: 'object',
    properties: {
      destination: { type: 'string' },
      days: { type: 'number' },
      budget: { type: 'string' },
      budgetAmount: { type: 'number' },
      preferences: { type: 'string' },
      userMemory: { type: 'object' },
    },
    required: ['destination', 'days'],
  },
  outputSchema: {
    bestAreas: 'string[]',
    options: 'array',
  },

  async execute(input) {
    const { destination, days, budget, budgetAmount, userMemory } = input;
    const searchData = await webSearch(`${destination} best hotels areas to stay`, 5);

    return generateJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Destination: ${destination}
Days: ${days}
Budget: ${budget || 'moderate'}${budgetAmount ? ` (max ~${budgetAmount})` : ''}
Stored User Memory: ${JSON.stringify(userMemory || {})}
Search data: ${JSON.stringify(searchData)}`,
      agentName: 'Hotel Agent',
    });
  },
};

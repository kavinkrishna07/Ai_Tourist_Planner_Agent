import { generateJSON } from '../services/geminiService.js';

const SYSTEM_PROMPT = `You are the Packing Agent for a travel planning system.
Create a categorized packing checklist based on destination, weather, and trip duration.

Output JSON:
{
  "categories": {
    "clothing": ["string"],
    "footwear": ["string"],
    "toiletries": ["string"],
    "electronics": ["string"],
    "documents": ["string"]
  },
  "essentials": ["string"]
}`;

export const packingAgent = {
  id: 'packing',
  name: 'Packing Agent',
  role: 'Creates a categorized packing checklist tailored to weather and trip length',
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: {
    type: 'object',
    properties: {
      destination: { type: 'string' },
      days: { type: 'number' },
      preferences: { type: 'string' },
      priorOutputs: { type: 'object' },
    },
    required: ['destination', 'days'],
  },
  outputSchema: {
    categories: 'object',
    essentials: 'string[]',
  },

  async execute(input) {
    const { destination, days, preferences, priorOutputs } = input;
    const weatherData = priorOutputs?.weather || null;

    return generateJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Destination: ${destination}
Days: ${days}
Preferences: ${preferences || 'none'}
Weather agent output: ${JSON.stringify(weatherData)}`,
      agentName: 'Packing Agent',
    });
  },
};

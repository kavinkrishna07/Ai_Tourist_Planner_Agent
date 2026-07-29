import { generateJSON } from '../services/geminiService.js';

const SYSTEM_PROMPT = `You are the Packing Agent for a travel planning system.
Create a categorized packing checklist tailored to the target destination, travel type, weather, and trip duration.

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
    required: ['destination'],
  },
  outputSchema: {
    categories: 'object',
    essentials: 'string[]',
  },

  async execute(input) {
    const destination = input.destination || 'destination';
    const days = input.days || 3;
    const { preferences, travelType, specialRequirements, priorOutputs } = input;
    const weatherData = priorOutputs?.weather || null;

    return generateJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Destination: ${destination}
Days: ${days}
Travel Type: ${travelType || 'general'}
Preferences: ${preferences || 'none'}
Special Requirements: ${JSON.stringify(specialRequirements || [])}
Weather agent output: ${JSON.stringify(weatherData)}`,
      agentName: 'Packing Agent',
    });
  },
};

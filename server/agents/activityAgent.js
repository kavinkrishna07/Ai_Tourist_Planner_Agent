import { generateJSON } from '../services/geminiService.js';
import { getNearbyAttractions } from '../tools/mapTool.js';
import { searchTravelInfo } from '../tools/searchTool.js';

const SYSTEM_PROMPT = `You are the Activity Agent for a travel planning system.
Recommend top sights and unique experiences tailored to the traveler for the specified destination.
IMPORTANT: Respect stored user memory preferences (e.g. avoid crowded places, love beaches & nature).

Output JSON:
{
  "topSights": [{ "name": "string", "type": "string", "duration": "string", "bestTime": "string", "tip": "string" }],
  "uniqueExperiences": [{ "name": "string", "duration": "string", "priceEstimate": number }]
}`;

export const activityAgent = {
  id: 'activity',
  name: 'Activity Agent',
  role: 'Suggests top sights and unique experiences',
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: {
    type: 'object',
    properties: {
      destination: { type: 'string' },
      days: { type: 'number' },
      preferences: { type: 'string' },
      userMemory: { type: 'object' },
    },
    required: ['destination'],
  },
  outputSchema: {
    topSights: 'array',
    uniqueExperiences: 'array',
  },

  async execute(input) {
    const destination = input.destination || 'destination';
    const days = input.days || 3;
    const { preferences, travelType, specialRequirements, userMemory } = input;

    const attractions = await getNearbyAttractions(destination);
    const searchData = await searchTravelInfo(destination, 'things to do activities sights');

    return generateJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Destination: ${destination}
Days: ${days}
Travel Type: ${travelType || 'general'}
Preferences: ${preferences || 'general sightseeing'}
Special Requirements: ${JSON.stringify(specialRequirements || [])}
Stored User Memory: ${JSON.stringify(userMemory || {})}
Attractions: ${JSON.stringify(attractions)}
Search data: ${JSON.stringify(searchData)}`,
      agentName: 'Activity Agent',
    });
  },
};

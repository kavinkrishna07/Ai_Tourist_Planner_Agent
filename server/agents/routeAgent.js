import { generateJSON } from '../services/geminiService.js';
import { getNearbyAttractions, getRouteInfo, getLiveFlights } from '../tools/mapTool.js';

const SYSTEM_PROMPT = `You are the Route Planner Agent for a travel planning system.
Design efficient daily routes grouping nearby attractions with transport recommendations and flight options when available.

Output JSON:
{
  "dailyRoutes": [{
    "day": number,
    "area": "string",
    "attractions": ["string"],
    "transportMode": "string",
    "estimatedTravelTime": "string",
    "tips": "string"
  }],
  "overallStrategy": "string",
  "flightInsights": "string"
}`;

export const routeAgent = {
  id: 'route',
  name: 'Route Planner Agent',
  role: 'Plans daily routes grouping nearby attractions with transport recommendations & flight info',
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: {
    type: 'object',
    properties: {
      destination: { type: 'string' },
      days: { type: 'number' },
      preferences: { type: 'string' },
    },
    required: ['destination', 'days'],
  },
  outputSchema: {
    dailyRoutes: 'array',
    overallStrategy: 'string',
    flightInsights: 'string',
  },

  async execute(input) {
    const { destination, days, preferences } = input;
    const attractions = await getNearbyAttractions(destination);
    const sampleRoute = await getRouteInfo('Airport', destination);
    const flightData = await getLiveFlights(destination);

    return generateJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Destination: ${destination}
Days: ${days}
Preferences: ${preferences || 'none'}
Live Geocoded Attractions: ${JSON.stringify(attractions)}
Live Route Calculation: ${JSON.stringify(sampleRoute)}
Live Flight Schedule: ${JSON.stringify(flightData)}`,
      agentName: 'Route Planner Agent',
    });
  },
};

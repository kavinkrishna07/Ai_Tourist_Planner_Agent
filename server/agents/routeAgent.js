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
      origin: { type: 'string' },
      days: { type: 'number' },
      preferences: { type: 'string' },
    },
    required: ['destination'],
  },
  outputSchema: {
    dailyRoutes: 'array',
    overallStrategy: 'string',
    flightInsights: 'string',
  },

  async execute(input) {
    const destination = input.destination || 'destination';
    const origin = input.origin || 'Airport';
    const days = input.days || 3;
    const { preferences, travelType } = input;

    const attractions = await getNearbyAttractions(destination);
    const sampleRoute = await getRouteInfo(origin, destination);
    const flightData = await getLiveFlights(destination);

    return generateJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Destination: ${destination}
Origin: ${origin}
Days: ${days}
Travel Type: ${travelType || 'general'}
Preferences: ${preferences || 'none'}
Live Geocoded Attractions: ${JSON.stringify(attractions)}
Live Route Calculation: ${JSON.stringify(sampleRoute)}
Live Flight Schedule: ${JSON.stringify(flightData)}`,
      agentName: 'Route Planner Agent',
    });
  },
};

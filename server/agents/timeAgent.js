import { generateJSON } from '../services/geminiService.js';
import { searchTravelInfo } from '../tools/searchTool.js';

const SYSTEM_PROMPT = `You are the Time Manager Agent (⏰) for WanderWise Travel Planner.
Your role: Calculate and organize precise opening/closing hours, duration spent per spot, best visiting times of day, and optimal daily time slots for attractions at the destination.

Responsibilities:
1. Provide accurate opening and closing hours for key attractions at the destination.
2. Estimate realistic time spent (e.g., "1.5 hours", "3 hours", "Half day") per attraction.
3. Determine the best time window to visit (e.g., "8:30 AM - Early Morning", "5:30 PM - Sunset").
4. Outline structured daily time slots (Morning, Afternoon, Evening/Sunset) with travel buffers.

Output JSON schema:
{
  "attractionSchedules": [
    {
      "name": "string - attraction name",
      "openingHours": "string - e.g. 9:00 AM - 6:00 PM",
      "timeSpent": "string - e.g. 2 hours",
      "bestVisitingTime": "string - e.g. Early morning at 8:30 AM to beat crowds",
      "closedDays": "string - e.g. None or Mondays"
    }
  ],
  "suggestedTimeSlots": [
    {
      "slot": "string - e.g. Morning (8:30 AM - 11:30 AM)",
      "activityType": "string - e.g. Outdoor sights & walking tours"
    },
    {
      "slot": "string - e.g. Afternoon (1:30 PM - 4:30 PM)",
      "activityType": "string - e.g. Indoor museums & air-conditioned dining"
    },
    {
      "slot": "string - e.g. Evening / Sunset (5:30 PM - 8:00 PM)",
      "activityType": "string - e.g. Viewpoints, sunset cruises & night markets"
    }
  ],
  "timeManagementTips": [
    "string - practical tip for saving time during the trip"
  ]
}`;

export const timeAgent = {
  id: 'time',
  name: 'Time Manager',
  role: 'Calculates opening/closing hours, time spent per spot, best visiting times, and daily schedule buffers',
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: {
    type: 'object',
    properties: {
      destination: { type: 'string' },
      days: { type: 'number' },
    },
  },
  outputSchema: {
    attractionSchedules: 'array',
    suggestedTimeSlots: 'array',
    timeManagementTips: 'array',
  },

  async execute(input) {
    const destination = input.destination || 'the target destination';
    const days = input.days || 3;

    // Search live web for opening hours and timings if destination is known
    let liveSearchResults = '';
    try {
      if (destination && destination !== 'the target destination') {
        const query = `${destination} top attractions opening hours time spent best time to visit`;
        console.log(`[TavilySearch] Fetching live opening hours info for: "${query}"...`);
        const searchRes = await searchTravelInfo(query);
        if (searchRes) {
          liveSearchResults = typeof searchRes === 'string' ? searchRes : JSON.stringify(searchRes);
        }
      }
    } catch (err) {
      console.warn('[Time Agent] Live search error:', err.message);
    }

    const userPrompt = `Destination: ${destination}
Trip Length: ${days} days
Live Search Data on Timings:
${liveSearchResults || 'No live search data available. Rely on standard verified knowledge.'}

Calculate opening/closing hours, recommended duration spent, best visiting time of day, and structured time slots.`;

    return generateJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      agentName: 'Time Manager',
    });
  },
};

import { generateJSON } from '../services/geminiService.js';
import { getWeatherForecast } from '../tools/weatherTool.js';
import { webSearch } from '../tools/searchTool.js';

const SYSTEM_PROMPT = `You are the Weather Agent for a travel planning system.
Analyze weather data and provide forecasts, temperature ranges, and packing hints.

Output JSON:
{
  "forecast": [{ "day": number, "date": string, "condition": string, "highC": number, "lowC": number, "humidity": number }],
  "summary": "string",
  "tempRange": { "high": number, "low": number, "unit": "C" },
  "packingHints": ["string"]
}`;

export const weatherAgent = {
  id: 'weather',
  name: 'Weather Agent',
  role: 'Provides weather forecasts, temperature ranges, and weather-based packing hints',
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
    forecast: 'array',
    summary: 'string',
    tempRange: 'object',
    packingHints: 'string[]',
  },

  async execute(input) {
    const { destination, days } = input;
    const weatherData = await getWeatherForecast(destination, days);
    const searchData = await webSearch(`${destination} weather forecast travel`, 3);

    return generateJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Destination: ${destination}
Days: ${days}
Weather tool data: ${JSON.stringify(weatherData)}
Web search: ${JSON.stringify(searchData)}`,
      agentName: 'Weather Agent',
    });
  },
};

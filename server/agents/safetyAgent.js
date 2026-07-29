import { generateJSON } from '../services/geminiService.js';
import { searchTravelInfo } from '../tools/searchTool.js';

export const safetyAgent = {
  id: 'safety',
  name: 'Safety Agent',
  role: 'Provides health/security tips, emergency info, and dos & don\'ts',
  outputSchema: {
    healthTips: 'string[]',
    securityTips: 'string[]',
    emergencyInfo: '{ police, ambulance, embassy }',
    dosAndDonts: '{ dos: string[], donts: string[] }',
  },

  async execute(input) {
    const destination = input.destination || 'destination';
    const searchData = await searchTravelInfo(destination, 'safety travel advisory health emergency');

    const systemPrompt = `You are the Safety Agent for a travel planning system.
Your role: Provide health and security advice, emergency contacts, and cultural dos/don'ts for safe travel in the specified destination.

Output JSON schema:
{
  "healthTips": ["string"],
  "securityTips": ["string"],
  "emergencyInfo": {
    "police": "string — number or contact",
    "ambulance": "string",
    "embassy": "string — guidance for finding embassy"
  },
  "dosAndDonts": {
    "dos": ["string"],
    "donts": ["string"]
  }
}`;

    const userPrompt = `Destination: ${destination}
Travel type: ${input.travelType || 'general'}
Search data: ${JSON.stringify(searchData)}

Provide comprehensive safety information.`;

    return generateJSON({
      systemPrompt,
      userPrompt,
      schema: safetyAgent.outputSchema,
      agentName: safetyAgent.name,
    });
  },
};

export async function runSafetyAgent(tripContext) {
  const result = await safetyAgent.execute(tripContext);
  return { agent: safetyAgent.name, role: safetyAgent.role, data: result };
}

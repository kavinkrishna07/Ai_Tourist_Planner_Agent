import { generateJSON } from '../services/geminiService.js';
import { searchTravelInfo } from '../tools/searchTool.js';

export const localGuideAgent = {
  id: 'localGuide',
  name: 'Local Guide',
  role: 'Shares cultural etiquette, hidden gems, and useful local phrases',
  outputSchema: {
    culturalEtiquette: 'string[]',
    hiddenGems: 'array of { name, description, bestFor }',
    usefulPhrases: 'array of { phrase, local, pronunciation }',
  },

  async execute(input) {
    const { destination } = input;
    const searchData = await searchTravelInfo(destination, 'culture etiquette hidden gems local tips');

    const systemPrompt = `You are the Local Guide Agent for a travel planning system.
Your role: Share cultural etiquette, off-the-beaten-path hidden gems, and useful local phrases.

Output JSON schema:
{
  "culturalEtiquette": ["string — important cultural norms"],
  "hiddenGems": [{
    "name": "string",
    "description": "string",
    "bestFor": "string — e.g. Morning coffee, Photography"
  }],
  "usefulPhrases": [{
    "phrase": "string — English meaning",
    "local": "string — in local language",
    "pronunciation": "string — phonetic guide"
  }]
}`;

    const userPrompt = `Destination: ${destination}
Search data: ${JSON.stringify(searchData)}

Provide cultural tips, hidden gems, and useful phrases.`;

    return generateJSON({
      systemPrompt,
      userPrompt,
      schema: localGuideAgent.outputSchema,
      agentName: localGuideAgent.name,
    });
  },
};

export async function runLocalGuideAgent(tripContext) {
  const result = await localGuideAgent.execute(tripContext);
  return { agent: localGuideAgent.name, role: localGuideAgent.role, data: result };
}

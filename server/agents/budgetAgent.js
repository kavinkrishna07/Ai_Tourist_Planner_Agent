import { generateJSON } from '../services/geminiService.js';
import { getCostEstimates } from '../tools/budgetTool.js';

const SYSTEM_PROMPT = `You are the Budget Agent for a travel planning system.
Provide detailed cost estimates with category breakdowns and savings tips.
Respect the user's stated budget amount and currency if provided.

Output JSON:
{
  "totalCost": number,
  "currency": "string",
  "breakdown": { "accommodation": number, "food": number, "activities": number, "transport": number, "misc": number },
  "perDayAverage": number,
  "savingsTips": ["string"]
}`;

export const budgetAgent = {
  id: 'budget',
  name: 'Budget Agent',
  role: 'Calculates total trip cost with category breakdown and savings tips',
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: {
    type: 'object',
    properties: {
      destination: { type: 'string' },
      days: { type: 'number' },
      budget: { type: 'string' },
      budgetAmount: { type: 'number' },
      budgetCurrency: { type: 'string' },
      preferences: { type: 'string' },
    },
    required: ['destination', 'days'],
  },
  outputSchema: {
    totalCost: 'number',
    currency: 'string',
    breakdown: 'object',
    perDayAverage: 'number',
    savingsTips: 'string[]',
  },

  async execute(input) {
    const { destination, days, budget, budgetAmount, budgetCurrency } = input;
    const costData = await getCostEstimates(destination, days, budget || 'moderate');

    return generateJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Destination: ${destination}
Days: ${days}
Budget level: ${budget || 'moderate'}
User budget cap: ${budgetAmount ? `${budgetAmount} ${budgetCurrency || 'INR'}` : 'not specified'}
Cost tool data: ${JSON.stringify(costData)}`,
      agentName: 'Budget Agent',
    });
  },
};

import { generateJSON } from '../services/geminiService.js';
import { getCostEstimates } from '../tools/budgetTool.js';

const SYSTEM_PROMPT = `You are the Budget Agent for a travel planning system.
Provide detailed cost estimates with category breakdowns and savings tips tailored specifically to the destination and travel requirements.
Respect the user's stated budget amount, currency, or tier (budget, moderate, luxury) if provided.

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
    required: ['destination'],
  },
  outputSchema: {
    totalCost: 'number',
    currency: 'string',
    breakdown: 'object',
    perDayAverage: 'number',
    savingsTips: 'string[]',
  },

  async execute(input) {
    const destination = input.destination || 'destination';
    const days = input.days || 3;
    const budgetLevel = input.budgetLevel || input.budget || 'moderate';
    const budgetAmount = input.budgetAmount;
    const budgetCurrency = input.budgetCurrency || 'USD';

    const costData = await getCostEstimates(destination, days, budgetLevel);

    return generateJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Destination: ${destination}
Days: ${days}
Budget level: ${budgetLevel}
User target budget: ${budgetAmount ? `${budgetAmount} ${budgetCurrency}` : 'not specified'}
Travel type: ${input.travelType || 'not specified'}
Cost tool data: ${JSON.stringify(costData)}`,
      agentName: 'Budget Agent',
    });
  },
};

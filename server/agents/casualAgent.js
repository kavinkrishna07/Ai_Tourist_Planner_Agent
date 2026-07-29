import { generateJSON } from '../services/geminiService.js';

const SYSTEM_PROMPT = `You are the Casual Chat & Memory Agent for WanderWise Travel Planner.
Your role: Warmly address casual greetings (e.g., "hii", "hello", "how are you?"), general chitchat, or out-of-context user inputs.
Maintain conversational memory, be helpful, welcoming, and gently guide the user on how WanderWise can help them plan their next dream trip.

Output JSON:
{
  "greeting": "string - warm personalized greeting",
  "reply": "string - helpful conversational reply maintaining context",
  "suggestions": ["string - 3 short sample prompts the user can try next"]
}`;

export const casualAgent = {
  id: 'casual',
  name: 'Casual Chat Agent',
  role: 'Handles casual greetings, conversational chitchat, and maintains conversation context',
  systemPrompt: SYSTEM_PROMPT,
  inputSchema: {
    type: 'object',
    properties: {
      message: { type: 'string' },
      history: { type: 'array' },
    },
    required: ['message'],
  },
  outputSchema: {
    greeting: 'string',
    reply: 'string',
    suggestions: 'string[]',
  },

  async execute(input) {
    const { message, history } = input;
    const historyText = history && history.length > 0
      ? history.slice(-4).map((h) => `${h.sender}: ${h.text}`).join('\n')
      : 'No prior history.';

    return generateJSON({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `User Message: "${message}"
Recent Conversation History:
${historyText}`,
      agentName: 'Casual Chat Agent',
    });
  },
};

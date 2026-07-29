import { generateJSON } from '../services/geminiService.js';
import { weatherAgent } from './weatherAgent.js';
import { budgetAgent } from './budgetAgent.js';
import { routeAgent } from './routeAgent.js';
import { hotelAgent } from './hotelAgent.js';
import { foodAgent } from './foodAgent.js';
import { activityAgent } from './activityAgent.js';
import { packingAgent } from './packingAgent.js';
import { safetyAgent } from './safetyAgent.js';
import { localGuideAgent } from './localGuideAgent.js';
import { casualAgent } from './casualAgent.js';
import { memoryAgent } from './memoryAgent.js';

export const travelManagerAgent = {
  name: 'Travel Manager',
  role: 'Coordinates specialist agents and synthesizes a cohesive day-by-day itinerary',
};

const AGENT_RUNNERS = {
  'Memory Agent': memoryAgent,
  'Casual Chat Agent': casualAgent,
  'Weather Agent': weatherAgent,
  'Budget Agent': budgetAgent,
  'Route Planner': routeAgent,
  'Hotel Agent': hotelAgent,
  'Food Agent': foodAgent,
  'Activity Agent': activityAgent,
  'Safety Agent': safetyAgent,
  'Local Guide': localGuideAgent,
  'Packing Agent': packingAgent,
};

function extractDestination(message) {
  if (!message) return 'Paris';

  const lower = message.toLowerCase();
  if (lower.includes('new your') || lower.includes('newyork') || lower.includes('new york')) return 'New York';
  if (lower.includes('los angeles')) return 'Los Angeles';
  if (lower.includes('san francisco')) return 'San Francisco';
  if (lower.includes('kuala lumpur')) return 'Kuala Lumpur';

  const stopWords = ['starting', 'from', 'with', 'and', 'for', 'the', 'middle', 'august', 'july', 'june', 'september', 'october', 'november', 'december', 'january', 'february', 'march', 'april', 'may', 'days', 'day', 'trip', 'flight', 'flights', 'weather', 'hotel', 'hotels', 'budget', 'food'];

  const match = message.match(/(?:to|visit|in|for|explore|around)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
  if (match && match[1]) {
    const parts = match[1].trim().split(/\s+/);
    const valid = parts.filter(w => !stopWords.includes(w.toLowerCase()));
    if (valid.length > 0) return valid.join(' ');
  }

  const words = message.split(/[\s,.\!?]+/);
  for (const w of words) {
    const clean = w.replace(/[^a-zA-Z]/g, '');
    if (clean.length > 2 && !stopWords.includes(clean.toLowerCase()) && !['Plan', 'Trip', 'Days', 'With', 'Weather', 'Flights', 'Show', 'Help', 'Can', 'Need'].includes(clean)) {
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    }
  }

  return 'Bali';
}

function extractDays(message) {
  if (!message) return 3;
  const match = message.match(/(\d+)\s*[-_\s]?(?:day|days)/i);
  return match ? parseInt(match[1], 10) : 3;
}

export async function runTravelManager(tripContext, onAgentComplete) {
  const message = tripContext.message || `Plan a ${tripContext.days || 3}-day trip to ${tripContext.destination || 'Paris'} with a ${tripContext.budget || 'moderate'} budget`;
  
  // Step 0: Memory Processing
  if (onAgentComplete) onAgentComplete('Memory Agent');
  await memoryAgent.saveConversation('user', message);
  await memoryAgent.extractAndUpdatePreferences(message);
  const userMemory = await memoryAgent.getMemory();

  const destination = tripContext.destination || extractDestination(message);
  const days = tripContext.days || extractDays(message);
  const updatedContext = { 
    ...tripContext, 
    message, 
    destination, 
    days,
    userMemory: userMemory.preferences
  };

  if (onAgentComplete) onAgentComplete('Travel Manager');

  const isCasualGreeting = message ? /^(hi|hii|hiii|hello|hey|heyy|greetings|howdy|sup|who are you|how are you|what can you do|good morning|good evening|good afternoon)[\s!\?]*$/i.test(message.trim()) : false;

  let requiredAgents = [];
  if (isCasualGreeting) {
    requiredAgents = ['Casual Chat Agent'];
  } else {
    // Step 1: Use LLM to determine which agents to run
    const routingPrompt = `You are the Travel Manager Agent. 
Determine which specialist agents are needed to answer the user's travel request.
Available agents: ${Object.keys(AGENT_RUNNERS).filter(a => a !== 'Memory Agent').join(', ')}.
User request: "${message}"
Stored User Preferences: ${JSON.stringify(userMemory.preferences)}

Output JSON schema:
{
  "selectedAgents": ["string - name of agent"]
}`;

    try {
      const routingResult = await generateJSON({
        systemPrompt: routingPrompt,
        userPrompt: 'Which agents do we need?',
        schema: {},
        agentName: 'Travel Manager (Routing)'
      });
      requiredAgents = routingResult.selectedAgents || [];
    } catch (err) {
      console.error('Routing error, defaulting to essential agents', err);
      requiredAgents = ['Weather Agent', 'Activity Agent'];
    }
  }

  // Filter to valid agents
  const validAgents = requiredAgents.filter(a => AGENT_RUNNERS[a] && a !== 'Memory Agent');
  
  if (validAgents.length === 0) {
    validAgents.push('Activity Agent');
  }

  const agentOutputs = [];

  // Step 2: Run selected agents sequentially with minor throttling
  for (const agentName of validAgents) {
    const agent = AGENT_RUNNERS[agentName];
    try {
      const data = await agent.execute(updatedContext);
      const result = { agent: agent.name, role: agent.role, data: data };
      if (onAgentComplete) onAgentComplete(agent.name);
      agentOutputs.push(result);
      await new Promise(r => setTimeout(r, 150));
    } catch (err) {
      console.warn(`[Travel Manager] ${agentName} execution warning:`, err.message);
    }
  }

  const synthesis = await synthesizeItinerary(updatedContext, agentOutputs, userMemory.preferences);

  // Save Assistant response and generated trip to Memory
  if (synthesis?.response) {
    await memoryAgent.saveConversation('assistant', synthesis.response);
  }
  if (!isCasualGreeting && destination) {
    await memoryAgent.saveTripPlan({ destination, days, budget: updatedContext.budget, preferences: message, planData: synthesis });
  }

  return {
    ...synthesis,
    userMemory: userMemory.preferences,
    agents: [
      { agent: 'Memory Agent', role: memoryAgent.role, data: userMemory.preferences },
      ...agentOutputs.map(({ agent, role, data }) => ({ agent, role, data }))
    ],
  };
}

async function synthesizeItinerary(tripContext, agentOutputs, userMemoryPreferences) {
  const { message } = tripContext;

  const systemPrompt = `You are the Travel Manager Agent — the coordinator of a multi-agent travel planning system.
Your role: Synthesize outputs from specialist agents to answer the user's travel request.
Ensure your response directly addresses their request in a helpful, conversational manner. Use Markdown formatting.
Honor stored user memory preferences (e.g. accommodation preferences, food choices, avoided things).

Output JSON schema:
{
  "response": "string — The final synthesized response answering the user's message using the agent outputs."
}`;

  const agentSummary = agentOutputs.map(({ agent, data }) => ({
    agent,
    data,
  }));

  const userPrompt = `User Request: "${message}"

Stored Long-Term User Preferences:
${JSON.stringify(userMemoryPreferences, null, 2)}

Specialist agent outputs:
${JSON.stringify(agentSummary, null, 2)}

Synthesize a comprehensive, conversational response. Use Markdown formatting.`;

  const result = await generateJSON({
    systemPrompt,
    userPrompt,
    schema: {},
    agentName: travelManagerAgent.name,
  });

  return result;
}

export const AGENT_LIST = [
  { name: 'Memory Agent', icon: '🧠' },
  { name: 'Casual Chat Agent', icon: '💬' },
  { name: 'Weather Agent', icon: '🌤️' },
  { name: 'Budget Agent', icon: '💰' },
  { name: 'Route Planner', icon: '🗺️' },
  { name: 'Hotel Agent', icon: '🏨' },
  { name: 'Food Agent', icon: '🍽️' },
  { name: 'Activity Agent', icon: '🎯' },
  { name: 'Packing Agent', icon: '🧳' },
  { name: 'Safety Agent', icon: '🛡️' },
  { name: 'Local Guide', icon: '🌍' },
  { name: 'Travel Manager', icon: '✈️' },
];

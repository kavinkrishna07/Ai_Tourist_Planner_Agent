import { weatherAgent } from '../agents/weatherAgent.js';
import { budgetAgent } from '../agents/budgetAgent.js';
import { routeAgent } from '../agents/routeAgent.js';
import { hotelAgent } from '../agents/hotelAgent.js';
import { foodAgent } from '../agents/foodAgent.js';
import { activityAgent } from '../agents/activityAgent.js';
import { packingAgent } from '../agents/packingAgent.js';
import { safetyAgent } from '../agents/safetyAgent.js';
import { localGuideAgent } from '../agents/localGuideAgent.js';
import { casualAgent } from '../agents/casualAgent.js';
import { emailAgent } from '../agents/emailAgent.js';
import { timeAgent } from '../agents/timeAgent.js';

/** Registry keyed by agent id & agent name — orchestrator dispatches purely from LLM-selected ids/names */
export const AGENT_REGISTRY = {
  weather: weatherAgent,
  'Weather Agent': weatherAgent,
  budget: budgetAgent,
  'Budget Agent': budgetAgent,
  route: routeAgent,
  'Route Planner': routeAgent,
  hotel: hotelAgent,
  'Hotel Agent': hotelAgent,
  food: foodAgent,
  'Food Agent': foodAgent,
  activity: activityAgent,
  'Activity Agent': activityAgent,
  packing: packingAgent,
  'Packing Agent': packingAgent,
  safety: safetyAgent,
  'Safety Agent': safetyAgent,
  localGuide: localGuideAgent,
  'Local Guide': localGuideAgent,
  casual: casualAgent,
  'Casual Chat Agent': casualAgent,
  email: emailAgent,
  'Email Agent': emailAgent,
  time: timeAgent,
  'Time Manager': timeAgent,
};

export const AGENT_CATALOG = Object.values(AGENT_REGISTRY).map((a) => ({
  id: a.id,
  name: a.name,
  role: a.role,
}));

export async function executeSelectedAgents(selectedKeys, tripContext, priorOutputs = {}, onProgress) {
  const results = [];

  await Promise.all(
    selectedKeys.map(async (key) => {
      const agent = AGENT_REGISTRY[key];
      if (!agent) return;

      onProgress?.({ type: 'agent_working', agent: agent.name, agentId: agent.id });

      try {
        const input = { ...tripContext, priorOutputs };
        const data = await agent.execute(input);

        const result = { agentId: agent.id, agent: agent.name, role: agent.role, data };
        results.push(result);
        onProgress?.({ type: 'agent_complete', agent: agent.name, agentId: agent.id, data });
      } catch (err) {
        console.warn(`[Orchestrator] Error executing ${agent.name}:`, err.message);
        results.push({
          agentId: agent.id,
          agent: agent.name,
          role: agent.role,
          data: { error: true, message: `Agent failed to execute: ${err.message}` },
        });
      }
    })
  );

  return results;
}

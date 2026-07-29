import { weatherAgent } from '../agents/weatherAgent.js';
import { budgetAgent } from '../agents/budgetAgent.js';
import { routeAgent } from '../agents/routeAgent.js';
import { hotelAgent } from '../agents/hotelAgent.js';
import { foodAgent } from '../agents/foodAgent.js';
import { activityAgent } from '../agents/activityAgent.js';
import { packingAgent } from '../agents/packingAgent.js';
import { safetyAgent } from '../agents/safetyAgent.js';
import { localGuideAgent } from '../agents/localGuideAgent.js';

/** Registry keyed by agent id — orchestrator dispatches purely from LLM-selected ids */
export const AGENT_REGISTRY = {
  weather: weatherAgent,
  budget: budgetAgent,
  route: routeAgent,
  hotel: hotelAgent,
  food: foodAgent,
  activity: activityAgent,
  packing: packingAgent,
  safety: safetyAgent,
  localGuide: localGuideAgent,
};

export const AGENT_CATALOG = Object.values(AGENT_REGISTRY).map((a) => ({
  id: a.id,
  name: a.name,
  role: a.role,
}));

export async function executeSelectedAgents(selectedIds, tripContext, priorOutputs = {}, onProgress) {
  const results = [];

  await Promise.all(
    selectedIds.map(async (id) => {
      const agent = AGENT_REGISTRY[id];
      if (!agent) return;

      onProgress?.({ type: 'agent_working', agent: agent.name, agentId: id });

      const input = { ...tripContext, priorOutputs };
      const data = await agent.execute(input);

      const result = { agentId: id, agent: agent.name, role: agent.role, data };
      results.push(result);
      onProgress?.({ type: 'agent_complete', agent: agent.name, agentId: id, data });
    })
  );

  return results;
}

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
import { emailAgent } from './emailAgent.js';
import { timeAgent } from './timeAgent.js';

export const travelManagerAgent = {
  name: 'Travel Manager',
  role: 'Coordinates specialist agents dynamically based on extracted user intent, context, and memory',
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
  'Email Agent': emailAgent,
  'Time Manager': timeAgent,
};

const INTENT_SYSTEM_PROMPT = `You are the Travel Manager (Intent & Context Extractor) for WanderWise Multi-Agent Travel System.
Analyze the user's message, current context, and stored long-term preferences, and return a structured JSON decision.

AVAILABLE SPECIALIST AGENTS:
- "Casual Chat Agent": Handles casual greetings (hi, hello, how are you), general chitchat, or non-travel queries.
- "Weather Agent": Provides weather forecasts, temperature ranges, and weather tips.
- "Budget Agent": Estimates total trip cost, breakdown by categories, and savings tips.
- "Route Planner": Organizes day-by-day routes, attraction groupings, local transport, and flight schedules.
- "Hotel Agent": Recommends accommodations across budget tiers and best neighborhoods to stay.
- "Food Agent": Recommends must-try local dishes and specific restaurant suggestions matching dietary preferences.
- "Activity Agent": Suggests top sights, attractions, and unique experiences.
- "Packing Agent": Generates customized packing checklists tailored to weather and trip length.
- "Safety Agent": Provides health, safety advisories, emergency numbers, and cultural dos and don'ts.
- "Local Guide": Shares cultural etiquette, hidden gems, and useful local language phrases.
- "Time Manager": Calculates opening/closing hours of attractions, time spent per spot, best visiting times of day, and optimal daily time slots.
- "Email Agent": Formats and delivers the generated travel plan or itinerary to an email address. Select this if the user asks to email, send, mail, or forward the plan or provides an email address.

ROUTING RULES:
1. If the message is a casual greeting or small talk -> set "intentCategory" to "casual_chat" and select ["Casual Chat Agent"].
2. If the user asks for a specific topic (e.g., "What's the weather in Tokyo?"), select ONLY the relevant agents (e.g., ["Weather Agent"]).
3. If the user asks for a trip plan (e.g., "Plan a 5-day trip to Paris"), select all relevant specialist agents (e.g., ["Weather Agent", "Budget Agent", "Hotel Agent", "Food Agent", "Activity Agent", "Route Planner", "Packing Agent", "Local Guide", "Safety Agent", "Time Manager"]).
4. If the user asks to send/email the plan or mentions an email address -> include "Email Agent" in selectedAgents.
5. Extract structured details dynamically without inserting hardcoded fallback values.

Output JSON schema:
{
  "intentCategory": "trip_planning | specific_query | casual_chat | clarifying_response",
  "extractedContext": {
    "destination": "string or null",
    "origin": "string or null",
    "days": "number or null",
    "budgetLevel": "luxury | moderate | budget or null",
    "budgetAmount": "number or null",
    "budgetCurrency": "string or null",
    "travelType": "solo | family | couple | friends | business or null",
    "preferences": ["array of strings"],
    "specialRequirements": ["array of strings"]
  },
  "selectedAgents": ["array of string names from available agents"],
  "missingInformation": ["array of strings, e.g. 'destination' if user wants a full trip plan but didn't specify destination"]
}`;

export async function runTravelManager(tripContext, onAgentComplete) {
  const message = tripContext.message || '';

  // Step 0: Memory Processing
  if (onAgentComplete) onAgentComplete('Memory Agent');
  if (message) {
    await memoryAgent.saveConversation('user', message);
    await memoryAgent.extractAndUpdatePreferences(message);
  }
  const userMemory = await memoryAgent.getMemory();

  if (onAgentComplete) onAgentComplete('Travel Manager');

  // Step 1: Dynamic LLM Intent & Context Extraction
  let intentData;
  try {
    intentData = await generateJSON({
      systemPrompt: INTENT_SYSTEM_PROMPT,
      userPrompt: `User Message: "${message}"
Input Context: ${JSON.stringify({
        destination: tripContext.destination || null,
        days: tripContext.days || null,
        budget: tripContext.budget || null,
        preferences: tripContext.preferences || null,
      })}
Stored User Memory: ${JSON.stringify(userMemory.preferences)}`,
      schema: {},
      agentName: 'Travel Manager (Intent Extractor)',
    });
  } catch (err) {
    console.warn('[Travel Manager] LLM Intent Extraction warning:', err.message);
    intentData = {
      intentCategory: tripContext.destination ? 'trip_planning' : 'casual_chat',
      extractedContext: {
        destination: tripContext.destination || null,
        days: tripContext.days || null,
        budgetLevel: tripContext.budget || null,
        preferences: tripContext.preferences ? [tripContext.preferences] : [],
      },
      selectedAgents: tripContext.destination ? ['Weather Agent', 'Activity Agent', 'Hotel Agent', 'Food Agent'] : ['Casual Chat Agent'],
      missingInformation: [],
    };
  }

  // Merge extracted context with incoming context
  const extracted = intentData?.extractedContext || {};
  const destination = extracted.destination || tripContext.destination || null;
  const days = extracted.days || tripContext.days || null;
  const budgetLevel = extracted.budgetLevel || tripContext.budget || null;
  const preferences = Array.from(new Set([
    ...(extracted.preferences || []),
    ...(tripContext.preferences ? [tripContext.preferences] : []),
  ])).join(', ');

  const mergedContext = {
    ...tripContext,
    message,
    destination,
    days,
    budgetLevel,
    budgetAmount: extracted.budgetAmount || null,
    budgetCurrency: extracted.budgetCurrency || null,
    travelType: extracted.travelType || null,
    preferences,
    specialRequirements: extracted.specialRequirements || [],
    userMemory: userMemory.preferences,
  };

  // Step 2: Handle Missing Destination for Trip Planning
  if (intentData.intentCategory === 'trip_planning' && !destination) {
    const missingDestPrompt = `You are the Travel Manager Agent. 
The user wants to plan a trip, but has not specified a destination.
User message: "${message}"
Stored User Preferences: ${JSON.stringify(userMemory.preferences)}

Politely ask the user for their preferred destination. Offer 3 tailored destination suggestions based on their stored user preferences (e.g. beaches, nature, budget, luxury).
At the very end of your response, ALWAYS include 3 distinct follow-up questions under a "### ❓ What would you like to explore next?" heading so the user can easily continue.`;

    const clarificationResponse = await generateJSON({
      systemPrompt: missingDestPrompt,
      userPrompt: 'Ask the user for destination, suggest options based on memory, and include 3 follow-up questions at the end.',
      schema: {},
      agentName: travelManagerAgent.name,
    });

    const finalResponse = clarificationResponse.response || 
      `Where would you like to travel? Tell me your destination and how many days you're planning, and I'll create a custom trip for you!\n\n### ❓ What would you like to explore next?\n1. Would you like destination recommendations based on your preferences?\n2. What is your estimated budget for this trip?\n3. Are you traveling solo, with family, or with friends?`;

    await memoryAgent.saveConversation('assistant', finalResponse);

    return {
      response: finalResponse,
      extractedContext: mergedContext,
      userMemory: userMemory.preferences,
      agents: [{ agent: 'Memory Agent', role: memoryAgent.role, data: userMemory.preferences }],
    };
  }

  // Step 3: Determine and Validate Agents to Run
  let rawSelected = intentData.selectedAgents || [];
  if (!Array.isArray(rawSelected) || rawSelected.length === 0) {
    rawSelected = intentData.intentCategory === 'casual_chat' ? ['Casual Chat Agent'] : ['Activity Agent', 'Weather Agent'];
  }

  const validAgents = rawSelected.filter(a => AGENT_RUNNERS[a] && a !== 'Memory Agent');
  if (validAgents.length === 0) {
    validAgents.push(intentData.intentCategory === 'casual_chat' ? 'Casual Chat Agent' : 'Activity Agent');
  }

  // Step 4: Execute Selected Agents dynamically
  const agentOutputs = [];

  for (const agentName of validAgents) {
    const agent = AGENT_RUNNERS[agentName];
    try {
      if (onAgentComplete) onAgentComplete(agent.name);
      const data = await agent.execute(mergedContext);
      agentOutputs.push({ agent: agent.name, role: agent.role, data });
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      console.warn(`[Travel Manager] ${agentName} execution error:`, err.message);
      agentOutputs.push({
        agent: agent.name,
        role: agent.role,
        data: { warning: `Could not retrieve details from ${agent.name}: ${err.message}` },
      });
    }
  }

  // Direct return for Casual Chat Agent
  if (intentData.intentCategory === 'casual_chat' && agentOutputs.length === 1 && agentOutputs[0].agent === 'Casual Chat Agent') {
    const casualData = agentOutputs[0].data || {};
    const chatResponse = casualData.reply || casualData.greeting || `Hello! I'm WanderWise, your Multi-Agent AI Travel Planner. Where would you like to travel next?`;
    await memoryAgent.saveConversation('assistant', chatResponse);
    return {
      response: chatResponse,
      extractedContext: mergedContext,
      userMemory: userMemory.preferences,
      agents: [
        { agent: 'Memory Agent', role: memoryAgent.role, data: userMemory.preferences },
        ...agentOutputs,
      ],
    };
  }

  // Step 5: Synthesize Final Output for Trip Planning & Specific Queries
  const synthesis = await synthesizeItinerary(mergedContext, agentOutputs, userMemory.preferences, intentData);

  // Save Assistant response and trip details to Memory
  if (synthesis?.response) {
    await memoryAgent.saveConversation('assistant', synthesis.response);
  }
  if (intentData.intentCategory === 'trip_planning' && destination) {
    await memoryAgent.saveTripPlan({
      destination,
      days: days || 3,
      budget: budgetLevel || 'moderate',
      preferences,
      planData: synthesis,
    });
  }

  return {
    ...synthesis,
    extractedContext: mergedContext,
    userMemory: userMemory.preferences,
    agents: [
      { agent: 'Memory Agent', role: memoryAgent.role, data: userMemory.preferences },
      ...agentOutputs,
    ],
  };
}

async function synthesizeItinerary(tripContext, agentOutputs, userMemoryPreferences, intentData) {
  const { message } = tripContext;

  const systemPrompt = `You are the Travel Manager Agent — the head coordinator of a multi-agent AI travel planning system.
Your role: Synthesize all specialist agent outputs into an impressive, rich, beautifully formatted Markdown travel guide that wows the user.

FORMATTING REQUIREMENTS:
1. **Title & Overview**: Start with a warm greeting and high-level summary of the trip (${tripContext.destination ? `${tripContext.destination}` : ''}).
2. **Structured Sections**: Organize output using clear H2 and H3 markdown headers:
   - Weather Forecast (with Markdown table if data exists)
   - Budget & Cost Breakdown (total, daily avg, savings tips)
   - Accommodations & Stays (top areas & specific hotel options)
   - Food & Culinary Highlights (must-try dishes & restaurants)
   - Activities & Top Sights (sights, unique experiences)
   - Day-by-Day Route & Transport (daily breakdown)
   - Packing Checklist & Essentials
   - Local Etiquette & Safety Advisories
   - Email Status (if Email Agent ran)
3. **Personalization**: Explicitly mention stored user memory preferences (e.g. food restrictions, avoided things, accommodation tier).
4. **Mandatory Closing**: ALWAYS end your response with 3 specific, engaging follow-up questions under a "### ❓ What would you like to explore next?" heading.

Output JSON schema:
{
  "response": "string — The final synthesized rich Markdown response."
}`;

  const agentSummary = agentOutputs.map(({ agent, data }) => ({ agent, data }));

  const userPrompt = `User Request: "${message}"
Extracted Context: ${JSON.stringify(intentData?.extractedContext || {})}
Stored User Memory: ${JSON.stringify(userMemoryPreferences || {})}

Specialist Agent Outputs:
${JSON.stringify(agentSummary, null, 2)}

Synthesize a comprehensive, friendly, and beautifully structured Markdown response.`;

  try {
    const result = await generateJSON({
      systemPrompt,
      userPrompt,
      schema: {},
      agentName: travelManagerAgent.name,
    });

    if (result && result.response && !result.response.includes('I have coordinated with our specialist agents to draft a summary')) {
      return result;
    }
  } catch (err) {
    console.error('[Travel Manager] Synthesis error:', err.message);
  }

  // Fallback: Rich Dynamic Markdown Assembly if LLM returned stub text
  return {
    response: buildRichFallbackItinerary(tripContext, agentOutputs)
  };
}

function buildRichFallbackItinerary(tripContext, agentOutputs) {
  const dest = tripContext.destination || 'your destination';
  const days = tripContext.days || 3;
  const budget = tripContext.budgetLevel || 'moderate';

  const findAgent = (name) => agentOutputs.find(a => a.agent === name)?.data || null;

  const weather = findAgent('Weather Agent');
  const budgetData = findAgent('Budget Agent');
  const hotel = findAgent('Hotel Agent');
  const food = findAgent('Food Agent');
  const activity = findAgent('Activity Agent');
  const route = findAgent('Route Planner');
  const packing = findAgent('Packing Agent');
  const safety = findAgent('Safety Agent');
  const guide = findAgent('Local Guide');
  const email = findAgent('Email Agent');

  let md = `## 🌴 ${days}-Day Complete Travel Itinerary for ${dest}\n\n`;
  md += `Welcome! Our team of specialized AI agents has crafted a custom **${days}-day ${budget}** travel plan for **${dest}**.\n\n`;

  // 1. Weather
  if (weather) {
    md += `### 🌤️ Weather Forecast\n`;
    if (weather.summary) md += `${weather.summary}\n\n`;
    if (weather.forecast && Array.isArray(weather.forecast)) {
      md += `| Day | Condition | High (°C) | Low (°C) | Humidity |\n|---|---|---|---|---|\n`;
      weather.forecast.slice(0, days).forEach((f, i) => {
        md += `| Day ${i+1} | ${f.condition || 'Pleasant'} | ${f.highC || 28}°C | ${f.lowC || 20}°C | ${f.humidity || 65}% |\n`;
      });
      md += `\n`;
    }
  }

  // 2. Budget
  if (budgetData) {
    md += `### 💰 Estimated Cost & Budget Breakdown\n`;
    md += `- **Estimated Total Cost**: $${budgetData.totalCost || 1500} ${budgetData.currency || 'USD'}\n`;
    md += `- **Daily Average**: $${budgetData.perDayAverage || 300} / day\n`;
    if (budgetData.breakdown) {
      md += `- **Accommodation**: $${budgetData.breakdown.accommodation || 600}\n`;
      md += `- **Food & Dining**: $${budgetData.breakdown.food || 400}\n`;
      md += `- **Activities & Sights**: $${budgetData.breakdown.activities || 300}\n`;
      md += `- **Local Transport**: $${budgetData.breakdown.transport || 200}\n`;
    }
    if (budgetData.savingsTips && budgetData.savingsTips.length > 0) {
      md += `\n**Savings Tips**:\n`;
      budgetData.savingsTips.forEach(tip => md += `- ${tip}\n`);
    }
    md += `\n`;
  }

  // 3. Hotel
  if (hotel) {
    md += `### 🏨 Accommodation & Where to Stay\n`;
    if (hotel.bestAreas && hotel.bestAreas.length > 0) {
      md += `**Recommended Areas**: ${hotel.bestAreas.join(', ')}\n\n`;
    }
    if (hotel.options && Array.isArray(hotel.options)) {
      hotel.options.forEach(opt => {
        md += `- **${opt.name}** (${opt.tier || 'mid-range'}) — ~$${opt.pricePerNight || 120}/night (${opt.area || dest})\n`;
        if (opt.highlights) md += `  *Highlights*: ${opt.highlights.join(', ')}\n`;
      });
      md += `\n`;
    }
  }

  // 4. Food
  if (food) {
    md += `### 🍽️ Food & Dining Recommendations\n`;
    if (food.mustTryDishes && Array.isArray(food.mustTryDishes)) {
      md += `**Must-Try Dishes**:\n`;
      food.mustTryDishes.forEach(d => {
        md += `- **${d.name}**: ${d.description || ''} *(Find at: ${d.whereToFind || 'Local eateries'})*\n`;
      });
      md += `\n`;
    }
    if (food.restaurants && Array.isArray(food.restaurants)) {
      md += `**Top Restaurants**:\n`;
      food.restaurants.forEach(r => {
        md += `- **${r.name}** (${r.cuisine || 'Local'}, ${r.priceRange || '$$'}) in ${r.area || dest}\n`;
      });
      md += `\n`;
    }
  }

  // 5. Activity & Sights
  if (activity) {
    md += `### 🎯 Top Sights & Attractions\n`;
    if (activity.topSights && Array.isArray(activity.topSights)) {
      activity.topSights.forEach(s => {
        md += `- **${s.name}** (${s.type || 'Attraction'}) — ${s.duration || '2 hours'}. *Tip*: ${s.tip || 'Visit early'}.\n`;
      });
      md += `\n`;
    }
  }

  // 6. Day-by-Day Route
  if (route) {
    md += `### 🗺️ Day-by-Day Route\n`;
    if (route.dailyRoutes && Array.isArray(route.dailyRoutes)) {
      route.dailyRoutes.slice(0, days).forEach(d => {
        md += `#### Day ${d.day}: ${d.area || dest}\n`;
        if (d.attractions && Array.isArray(d.attractions)) {
          md += `- **Activities**: ${d.attractions.join(' -> ')}\n`;
        }
        md += `- **Transport**: ${d.transportMode || 'Local taxi / walking'} (${d.estimatedTravelTime || '30 mins'})\n\n`;
      });
    }
  }

  // 7. Packing
  if (packing) {
    md += `### 🧳 Packing Checklist\n`;
    if (packing.essentials && Array.isArray(packing.essentials)) {
      md += `**Essential Items**: ${packing.essentials.join(', ')}\n\n`;
    }
  }

  // 8. Time Manager
  const time = findAgent('Time Manager');
  if (time) {
    md += `### ⏰ Opening Hours & Time Schedule\n`;
    if (time.attractionSchedules && Array.isArray(time.attractionSchedules)) {
      md += `| Attraction | Opening Hours | Time Spent | Best Time to Visit |\n|---|---|---|---|\n`;
      time.attractionSchedules.forEach(s => {
        md += `| ${s.name || 'Attraction'} | ${s.openingHours || '9:00 AM - 6:00 PM'} | ${s.timeSpent || '2 hours'} | ${s.bestVisitingTime || 'Early Morning'} |\n`;
      });
      md += `\n`;
    }
    if (time.timeManagementTips && Array.isArray(time.timeManagementTips)) {
      md += `**Time Management Tips**:\n`;
      time.timeManagementTips.forEach(tip => md += `- ${tip}\n`);
      md += `\n`;
    }
  }

  // 9. Email status
  if (email) {
    md += `### 📧 Email Delivery Status\n`;
    md += `${email.message || 'Itinerary has been formatted for email delivery.'}\n\n`;
  }

  // Mandatory 3 follow-up questions
  md += `### ❓ What would you like to explore next?\n`;
  md += `1. Would you like me to adjust any specific day's schedule or activities for ${dest}?\n`;
  md += `2. Should I customize the accommodation choices to fit a different budget tier?\n`;
  md += `3. Would you like this full itinerary sent to another email address?`;

  return md;
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
  { name: 'Time Manager', icon: '⏰' },
  { name: 'Email Agent', icon: '📧' },
  { name: 'Travel Manager', icon: '✈️' },
];

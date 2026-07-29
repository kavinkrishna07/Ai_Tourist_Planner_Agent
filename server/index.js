import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runTravelManager, AGENT_LIST } from './agents/travelManager.js';
import { memoryAgent } from './agents/memoryAgent.js';
import { connectDB, isDBConnected } from './db/connect.js';
import { isLLMConfigured } from './services/grokService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize MongoDB Connection
connectDB();

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    llmConfigured: isLLMConfigured(),
    llmProvider: 'Grok (llama-3.3-70b-versatile)',
    dbConnected: isDBConnected(),
    agents: AGENT_LIST.length,
  });
});

app.get('/api/agents', (_req, res) => {
  res.json(AGENT_LIST);
});

// Memory Endpoints
app.get('/api/memory', async (_req, res) => {
  try {
    const memory = await memoryAgent.getMemory();
    res.json(memory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch memory profile', message: err.message });
  }
});

app.delete('/api/memory', async (_req, res) => {
  try {
    const result = await memoryAgent.clearMemory();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear memory profile', message: err.message });
  }
});

app.post('/api/plan', async (req, res) => {
  try {
    const { destination, days, budget, preferences, message } = req.body;

    const rawMessage = message?.trim() || 
      (destination ? `Plan a ${days ? `${days}-day ` : ''}trip to ${destination}${budget ? ` with a ${budget} budget` : ''}${preferences ? `. Preferences: ${preferences}` : ''}` : '');

    if (!rawMessage && !destination) {
      return res.status(400).json({ error: 'Destination or message is required' });
    }

    const tripContext = {
      message: rawMessage,
      destination: destination?.trim() || null,
      days: days ? Number(days) : null,
      budget: budget?.trim() || null,
      preferences: preferences?.trim() || '',
    };

    const plan = await runTravelManager(tripContext);

    res.json({
      ...plan,
      meta: {
        destination: plan?.extractedContext?.destination || tripContext.destination,
        days: plan?.extractedContext?.days || tripContext.days,
        budget: plan?.extractedContext?.budgetLevel || tripContext.budget,
        preferences: tripContext.preferences,
        generatedAt: new Date().toISOString(),
        llmMode: isLLMConfigured() ? 'grok' : 'mock',
      },
    });
  } catch (err) {
    console.error('Plan generation error:', err);
    res.status(500).json({ error: 'Failed to generate travel plan', message: err.message });
  }
});

app.get('/api/chat', async (req, res) => {
  const message = req.query.message;
  
  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Set up SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const sendEvent = (type, data) => {
    res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const response = await runTravelManager({ message }, async (agentName) => {
      sendEvent('agent_update', { agent: agentName });
      if (agentName === 'Memory Agent') {
        const mem = await memoryAgent.getMemory();
        sendEvent('memory_update', { preferences: mem.preferences });
      }
    });

    // Send updated user memory alongside the completion
    const currentMemory = await memoryAgent.getMemory();

    sendEvent('complete', { 
      response: response.response,
      userMemory: currentMemory.preferences,
      meta: { generatedAt: new Date().toISOString() } 
    });
    res.end();
  } catch (err) {
    console.error('Chat error:', err);
    sendEvent('error', { message: err.message });
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`Travel Planner API running on http://localhost:${PORT}`);
  console.log(`LLM mode: Grok (llama-3.3-70b-versatile API)`);
});

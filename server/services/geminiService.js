// Gemini API integration commented out as requested. Now using Grok API as single LLM provider.
/*
import { GoogleGenAI } from '@google/genai';
let geminiClient = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}
*/

import { 
  generateJSON as generateGrokJSON, 
  generateText as generateGrokText, 
  isLLMConfigured as isGrokConfigured 
} from './grokService.js';

export async function generateJSON({ systemPrompt, userPrompt, schema, agentName = 'Agent' }) {
  // Direct execution using Grok LLM
  return generateGrokJSON({ systemPrompt, userPrompt, schema, agentName });
}

export async function generateText({ systemPrompt, userPrompt }) {
  // Direct execution using Grok LLM
  return generateGrokText({ systemPrompt, userPrompt });
}

export function isGeminiConfigured() {
  return isGrokConfigured();
}

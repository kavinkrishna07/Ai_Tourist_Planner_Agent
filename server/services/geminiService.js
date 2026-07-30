import { 
  generateJSON as generateGrokJSON, 
  generateText as generateGrokText, 
  isLLMConfigured as isGrokConfigured 
} from './grokService.js';

export async function generateJSON({ systemPrompt, userPrompt, schema, agentName = 'Agent' }) {
  return generateGrokJSON({ systemPrompt, userPrompt, schema, agentName });
}

export async function generateText({ systemPrompt, userPrompt }) {
  return generateGrokText({ systemPrompt, userPrompt });
}

export function isGeminiConfigured() {
  return isGrokConfigured();
}

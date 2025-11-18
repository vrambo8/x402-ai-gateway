// Model pricing data (per 1000 tokens in USD)
export const MODEL_PRICING = {
  'gpt-4o': { input: 0.006, output: 0.018 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'o1': { input: 0.15, output: 0.6 },
  'o1-preview': { input: 0.015, output: 0.06 },
  'o1-mini': { input: 0.003, output: 0.012 },
};

export const MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'Fast & Affordable' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', category: 'Fast & Affordable' },
  { id: 'gpt-4o', name: 'GPT-4o', category: 'Advanced' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', category: 'Advanced' },
  { id: 'gpt-4', name: 'GPT-4', category: 'Advanced' },
  { id: 'o1-mini', name: 'o1 Mini', category: 'Reasoning' },
  { id: 'o1-preview', name: 'o1 Preview', category: 'Reasoning' },
  { id: 'o1', name: 'o1', category: 'Reasoning' },
];

export function formatPrice(usd) {
  if (usd < 0.000001) {
    return `$${(usd * 1000000).toFixed(2)}/M tokens`;
  } else if (usd < 0.001) {
    return `$${(usd * 1000).toFixed(2)}/K tokens`;
  }
  return `$${usd.toFixed(4)}/K tokens`;
}

// Simple token estimation (approximation)
// For accurate counting, you'd need to use tiktoken library
// This is a rough estimate: ~4 characters per token on average

export function estimateTokens(text) {
  if (!text) return 0;
  // Rough estimation: 4 characters ≈ 1 token
  return Math.ceil(text.length / 4);
}

export function estimateCost(inputText, maxOutputTokens, modelPricing) {
  const inputTokens = estimateTokens(inputText);
  const outputTokens = maxOutputTokens || 1000;

  const inputCost = (inputTokens / 1000) * modelPricing.input;
  const outputCost = (outputTokens / 1000) * modelPricing.output;

  return {
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

export function formatCost(cost) {
  if (cost < 0.000001) {
    return '<$0.000001';
  } else if (cost < 0.01) {
    return `$${cost.toFixed(6)}`;
  }
  return `$${cost.toFixed(4)}`;
}

import { estimateCost, formatCost } from '../utils/tokenCounter';

export default function CostEstimator({ prompt, maxTokens, modelPricing }) {
  if (!prompt || !modelPricing) {
    return null;
  }

  const cost = estimateCost(prompt, maxTokens, modelPricing);

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-4 text-sm shadow-lg shadow-cyan-500/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-cyan-300">Estimated Cost</span>
        </div>
        <span className="font-bold text-2xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          {formatCost(cost.totalCost)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className="text-slate-300 font-medium">Input</span>
          </div>
          <div className="text-slate-400">~{cost.inputTokens} tokens</div>
          <div className="text-cyan-400 font-semibold mt-1">{formatCost(cost.inputCost)}</div>
        </div>
        <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            <span className="text-slate-300 font-medium">Output</span>
          </div>
          <div className="text-slate-400">~{cost.outputTokens} tokens (max)</div>
          <div className="text-purple-400 font-semibold mt-1">{formatCost(cost.outputCost)}</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/10 flex items-start gap-2">
        <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-slate-500 italic">
          Actual cost may be lower if response is shorter than max tokens
        </p>
      </div>
    </div>
  );
}

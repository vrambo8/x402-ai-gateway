
import { MODELS, MODEL_PRICING, formatPrice } from '../utils/models';

export default function ModelSelector({ selectedModel, onModelChange }) {
  const groupedModels = MODELS.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <label htmlFor="model-select" className="text-sm font-semibold text-slate-200">
          AI Model
        </label>
      </div>
      <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full px-4 py-2.5 backdrop-blur-md bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%239ca3af%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3e%3c/svg%3e')] bg-no-repeat bg-[length:1.5em] bg-[right_0.5rem_center]"
      >
        {Object.entries(groupedModels).map(([category, models]) => (
          <optgroup key={category} label={category}>
            {models.map((model) => {
              const pricing = MODEL_PRICING[model.id];
              return (
                <option key={model.id} value={model.id} className="bg-slate-800 text-white">
                  {model.name} - In: {formatPrice(pricing.input)}, Out: {formatPrice(pricing.output)}
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

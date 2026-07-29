const AGENT_ICONS = {
  'Memory Agent': '🧠',
  'Casual Chat Agent': '💬',
  'Weather Agent': '🌤️',
  'Budget Agent': '💰',
  'Route Planner': '🗺️',
  'Hotel Agent': '🏨',
  'Food Agent': '🍽️',
  'Activity Agent': '🎯',
  'Packing Agent': '🧳',
  'Safety Agent': '🛡️',
  'Local Guide': '🌍',
  'Travel Manager': '✈️',
};

export function LoadingSkeleton({ activeAgents = [] }) {
  return (
    <div className="flex justify-start animate-in fade-in duration-300">
      {/* Avatar Icon */}
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#14B8A6] via-[#22D3EE] to-[#F59E0B] p-[1px] mr-3 mt-1 shrink-0 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
        <div className="w-full h-full bg-[#070a12] rounded-2xl flex items-center justify-center text-sm">
          ✨
        </div>
      </div>

      {/* Glass Loading Card */}
      <div className="max-w-[85%] sm:max-w-2xl rounded-3xl p-6 glass-panel border border-white/15 text-slate-100 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Ambient Light Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#22D3EE]/10 rounded-full blur-2xl pointer-events-none animate-pulse-glow" />

        <div className="flex flex-col gap-5">
          
          {/* Header Status */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5 text-[#22D3EE] font-bold text-xs tracking-wider uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] animate-ping" />
              Multi-Agent Collaboration in Progress...
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Grok LLM</span>
          </div>

          {/* Active Agent Chips */}
          <div className="flex flex-wrap gap-2">
            {activeAgents.length === 0 && (
              <span className="text-xs text-slate-400 italic">Travel Manager is initializing agents...</span>
            )}
            {activeAgents.map((agent, i) => (
              <span 
                key={i} 
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#14B8A6]/15 text-teal-200 text-xs font-bold border border-[#22D3EE]/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-md animate-in fade-in duration-300"
              >
                <span>{AGENT_ICONS[agent] || '🤖'}</span>
                {agent}
              </span>
            ))}
          </div>

          {/* VisionOS Shimmer Skeleton Bar Lines */}
          <div className="space-y-3 pt-2">
            <div className="h-4 w-3/4 rounded-xl skeleton-shimmer border border-white/5" />
            <div className="h-4 w-full rounded-xl skeleton-shimmer border border-white/5" />
            <div className="h-4 w-5/6 rounded-xl skeleton-shimmer border border-white/5" />
            <div className="h-4 w-2/3 rounded-xl skeleton-shimmer border border-white/5" />
          </div>

        </div>
      </div>
    </div>
  );
}

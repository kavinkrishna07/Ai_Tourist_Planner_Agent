const AGENT_DESCRIPTIONS = {
  'Weather Agent': 'Checking forecasts...',
  'Budget Agent': 'Crunching numbers...',
  'Route Planner': 'Mapping routes...',
  'Hotel Agent': 'Finding stays...',
  'Food Agent': 'Discovering cuisine...',
  'Activity Agent': 'Scouting activities...',
  'Packing Agent': 'Building checklist...',
  'Safety Agent': 'Reviewing safety...',
  'Local Guide': 'Gathering local tips...',
  'Travel Manager': 'Synthesizing itinerary...',
};

export default function LoadingState({ agents, activeAgents }) {
  const activeSet = new Set(activeAgents);
  const completedCount = activeAgents.length;
  const progress = Math.round((completedCount / agents.length) * 100);

  return (
    <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-light to-teal-light animate-pulse-ring mb-4">
          <span className="text-4xl animate-float">✈️</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-stone-800 mb-2">
          Agents collaborating...
        </h2>
        <p className="text-stone-500">
          {completedCount} of {agents.length} agents complete
        </p>
      </div>

      <div className="w-full bg-stone-200 rounded-full h-2 mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-warm to-teal-deep rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {agents.map((agent, i) => {
          const isActive = activeSet.has(agent.name);
          const isCurrent = activeAgents[activeAgents.length - 1] === agent.name;

          return (
            <div
              key={agent.name}
              className={`p-3 rounded-xl border transition-all duration-300 ${
                isActive
                  ? 'bg-white border-teal-deep/30 shadow-md scale-105'
                  : 'bg-white/40 border-stone-200 opacity-50'
              } ${isCurrent ? 'agent-dot-active' : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-2xl block mb-1">{agent.icon}</span>
              <p className="text-xs font-semibold text-stone-700 leading-tight">{agent.name}</p>
              {isActive && (
                <p className="text-[10px] text-teal-deep mt-1">
                  {AGENT_DESCRIPTIONS[agent.name]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

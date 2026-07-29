import { useState } from 'react';

const AGENT_ICONS = {
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

function renderAgentData(data) {
  if (!data || typeof data !== 'object') return null;

  return (
    <pre className="text-xs text-stone-600 whitespace-pre-wrap overflow-x-auto bg-stone-50 rounded-lg p-3 max-h-64 overflow-y-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function AgentCard({ agent, role, data }) {
  const [expanded, setExpanded] = useState(false);
  const icon = AGENT_ICONS[agent] || '🤖';

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50 transition-colors"
      >
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-800">{agent}</p>
          <p className="text-xs text-stone-500 truncate">{role}</p>
        </div>
        <span className={`text-stone-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-stone-100">
          {renderAgentData(data)}
        </div>
      )}
    </div>
  );
}

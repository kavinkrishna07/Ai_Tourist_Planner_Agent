import AgentCard from './AgentCard';

function DayCard({ day }) {
  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden animate-fade-in-up">
      <div className="bg-gradient-to-r from-amber-warm/10 to-teal-deep/10 px-5 py-3 border-b border-amber-100">
        <span className="text-xs font-bold text-teal-deep uppercase tracking-wider">Day {day.day}</span>
        <h3 className="font-display text-xl font-bold text-stone-800">{day.title}</h3>
      </div>
      <div className="p-5 space-y-4">
        {['morning', 'afternoon', 'evening'].map((period) => (
          <div key={period} className="flex gap-3">
            <span className="text-lg shrink-0">
              {period === 'morning' ? '🌅' : period === 'afternoon' ? '☀️' : '🌙'}
            </span>
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase">{period}</p>
              <p className="text-stone-700 text-sm">{day[period]}</p>
            </div>
          </div>
        ))}
        {day.meals && (
          <div className="pt-3 border-t border-stone-100">
            <p className="text-xs font-semibold text-stone-400 uppercase mb-2">Meals</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              {Object.entries(day.meals).map(([meal, place]) => (
                <div key={meal} className="bg-amber-light/30 rounded-lg px-3 py-2">
                  <span className="text-xs text-amber-700 font-medium capitalize">{meal}</span>
                  <p className="text-stone-600">{place}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ItineraryResults({ plan, agents }) {
  const {
    summary,
    itinerary = [],
    recommendations = [],
    totalEstimatedCost,
    packingChecklist = [],
    safetyTips = [],
    agents: agentOutputs = [],
    meta,
  } = plan;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero summary */}
      <div className="bg-gradient-to-br from-amber-warm to-teal-deep rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-amber-100 text-sm font-medium mb-1">
              {meta?.destination} · {meta?.days} days · {meta?.budget}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Your Trip Plan</h2>
            <p className="text-white/90 text-lg max-w-2xl">{summary}</p>
          </div>
          {totalEstimatedCost && (
            <div className="bg-white/20 backdrop-blur rounded-xl px-6 py-4 text-center shrink-0">
              <p className="text-amber-100 text-xs uppercase tracking-wider">Est. Total</p>
              <p className="text-3xl font-bold">${totalEstimatedCost.toLocaleString()}</p>
              <p className="text-amber-100 text-xs">USD</p>
            </div>
          )}
        </div>
        {meta?.llmMode === 'mock' && (
          <p className="mt-4 text-xs text-amber-100/80 bg-white/10 rounded-lg px-3 py-2 inline-block">
            Running in mock mode — add GEMINI_API_KEY to .env for live AI responses
          </p>
        )}
      </div>

      {/* Day-by-day itinerary */}
      <section>
        <h3 className="font-display text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
          <span>📅</span> Day-by-Day Itinerary
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {itinerary.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}
        </div>
      </section>

      {/* Recommendations + Packing + Safety */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h4 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
            <span>💡</span> Recommendations
          </h4>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-stone-600 flex gap-2">
                <span className="text-teal-deep shrink-0">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h4 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
            <span>🧳</span> Packing Checklist
          </h4>
          <ul className="space-y-1.5">
            {packingChecklist.map((item, i) => (
              <li key={i} className="text-sm text-stone-600 flex items-center gap-2">
                <input type="checkbox" className="accent-teal-deep rounded" readOnly />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <h4 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
            <span>🛡️</span> Safety Tips
          </h4>
          <ul className="space-y-2">
            {safetyTips.map((tip, i) => (
              <li key={i} className="text-sm text-stone-600 flex gap-2">
                <span className="text-amber-warm shrink-0">⚠</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Agent contributions */}
      <section>
        <h3 className="font-display text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
          <span>🤖</span> Agent Contributions
        </h3>
        <p className="text-stone-500 text-sm mb-4">
          Expand each card to see the detailed output from every specialist agent.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {agentOutputs.map(({ agent, role, data }) => (
            <AgentCard key={agent} agent={agent} role={role} data={data} />
          ))}
        </div>
      </section>
    </div>
  );
}

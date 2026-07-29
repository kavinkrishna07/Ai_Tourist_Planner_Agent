import { useState } from 'react';

export function MemoryBadge({ memory, onRefreshMemory }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const preferences = memory?.preferences || {
    accommodation: [],
    avoidedThings: [],
    travelInterests: [],
    foodPreferences: [],
    generalNotes: [],
  };

  const totalCount = 
    (preferences.accommodation?.length || 0) +
    (preferences.avoidedThings?.length || 0) +
    (preferences.travelInterests?.length || 0) +
    (preferences.foodPreferences?.length || 0) +
    (preferences.generalNotes?.length || 0);

  const handleClear = async (e) => {
    e.stopPropagation();
    setIsClearing(true);
    try {
      await fetch('/api/memory', { method: 'DELETE' });
      if (onRefreshMemory) await onRefreshMemory();
    } catch (err) {
      console.error('Failed to clear memory:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Quick Clear Memory button on Navbar */}
      <button
        onClick={handleClear}
        disabled={isClearing}
        className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        title="Clear all stored memory in MongoDB"
      >
        <span>🗑️</span>
        <span className="hidden sm:inline">Clear Memory</span>
      </button>

      {/* Memory Drawer Trigger Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium transition-all shadow-sm cursor-pointer"
        title="View Stored User Memory"
      >
        <span className="text-base">🧠</span>
        <span className="hidden sm:inline">Memory</span>
        <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-bold text-[11px]">
          {totalCount}
        </span>
      </button>

      {/* Memory Popover Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900/95 border border-indigo-500/30 backdrop-blur-2xl p-5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <div>
                <h3 className="font-bold text-sm text-white">Active User Memory</h3>
                <p className="text-[11px] text-slate-400">MongoDB Persistent Storage</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {totalCount === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs italic">
              No long-term preferences stored yet.<br/>
              Mention things like <span className="text-teal-300 font-normal">"I prefer budget hotels"</span> or <span className="text-teal-300 font-normal">"I don't like crowds"</span> to save memory.
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {preferences.accommodation?.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">🏨 Accommodation</span>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences.accommodation.map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-200 text-xs border border-teal-500/30 font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {preferences.travelInterests?.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">🏖️ Travel Interests</span>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences.travelInterests.map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 text-xs border border-indigo-500/30 font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {preferences.foodPreferences?.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">🍽️ Food Preferences</span>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences.foodPreferences.map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 text-xs border border-amber-500/30 font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {preferences.avoidedThings?.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">🚫 Avoided Things</span>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences.avoidedThings.map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-200 text-xs border border-rose-500/30 font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {preferences.generalNotes?.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">📝 Notes</span>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences.generalNotes.map((item, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-700 text-slate-200 text-xs font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Database: MongoDB</span>
            <button
              onClick={handleClear}
              disabled={isClearing}
              className="text-rose-400 hover:text-rose-300 font-bold transition-colors bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1 rounded-lg border border-rose-500/30 cursor-pointer disabled:opacity-50"
            >
              {isClearing ? 'Clearing...' : 'Erase All Memory 🗑️'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';

const ALL_AGENTS = [
  { name: 'Memory Agent', icon: '🧠', role: 'MongoDB User Memory & Preferences' },
  { name: 'Travel Manager', icon: '✈️', role: 'Multi-Agent Leader & Synthesizer' },
  { name: 'Weather Agent', icon: '🌤️', role: 'Live Weather Analysis' },
  { name: 'Budget Agent', icon: '💰', role: 'Cost Breakdown & Savings Tips' },
  { name: 'Route Planner', icon: '🗺️', role: 'Daily Routes & Flight Schedules' },
  { name: 'Hotel Agent', icon: '🏨', role: 'Accommodations Across Tiers' },
  { name: 'Food Agent', icon: '🍽️', role: 'Must-Try Cuisine & Restaurants' },
  { name: 'Activity Agent', icon: '🎯', role: 'Top Sights & Unique Experiences' },
  { name: 'Packing Agent', icon: '🧳', role: 'Customized Trip Checklists' },
  { name: 'Safety Agent', icon: '🛡️', role: 'Safety Guidelines & Emergency Info' },
  { name: 'Local Guide', icon: '🌍', role: 'Culture, Customs & Local Phrases' },
  { name: 'Casual Chat Agent', icon: '💬', role: 'General Chitchat & Greetings' },
];

export function Sidebar({ activeAgents = [], completedAgents = [], isOpen, onToggle }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        />
      )}

      <aside className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-80 glass-sidebar flex flex-col transition-all duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#22D3EE] flex items-center justify-center text-sm shadow-[0_0_15px_rgba(20,184,166,0.4)]">
              🤖
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">Agent Mesh</h2>
              <p className="text-[11px] text-teal-400 font-medium">12 Autonomous Agents</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        {/* Live Execution Overview Banner */}
        <div className="p-4 mx-4 mt-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">Network Status</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Grok Online
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
            <div 
              className="bg-gradient-to-r from-[#14B8A6] via-[#22D3EE] to-[#F59E0B] h-full transition-all duration-500"
              style={{
                width: activeAgents.length > 0 ? '75%' : completedAgents.length > 0 ? '100%' : '20%'
              }}
            />
          </div>
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            Specialist Agents
          </p>

          {ALL_AGENTS.map((agent) => {
            const isRunning = activeAgents.includes(agent.name);
            const isCompleted = completedAgents.includes(agent.name);

            return (
              <div
                key={agent.name}
                className={`p-3 rounded-2xl border transition-all duration-200 ${
                  isRunning
                    ? 'bg-[#14B8A6]/15 border-[#22D3EE]/50 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                    : isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg shrink-0">{agent.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200 truncate">{agent.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{agent.role}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 ml-2">
                    {isRunning ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22D3EE]/20 border border-[#22D3EE]/40 text-[#22D3EE] text-[10px] font-bold shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-ping" />
                        Running
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                        ✓ Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                        Ready
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            WanderWise Multi-Agent Framework
          </p>
        </div>
      </aside>
    </>
  );
}

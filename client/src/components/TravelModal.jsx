import { useState } from 'react';

export function TravelModal({ isOpen, onClose, onSubmit }) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState('moderate');
  const [preferences, setPreferences] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;

    const message = `Plan a ${days}-day trip to ${destination.trim()} with a ${budget} budget. Additional preferences: ${preferences.trim() || 'none'}.`;
    onSubmit(message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        {/* Glow Accent Sphere */}
        <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-[#22D3EE]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#F59E0B] p-[1px] shadow-lg">
              <div className="w-full h-full bg-[#070a12] rounded-2xl flex items-center justify-center text-lg">
                ✈️
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100 font-display">New Trip Generator</h3>
              <p className="text-xs text-[#22D3EE] font-medium">Structured Multi-Agent Itinerary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Destination Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Destination City / Region *
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Kyoto, Paris, Bali, New York"
              className="glass-input w-full px-4 py-3 text-sm text-white placeholder-slate-500"
            />
          </div>

          {/* Days Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Trip Duration (Days)
              </label>
              <span className="px-3 py-1 rounded-xl bg-[#14B8A6]/20 text-[#22D3EE] text-xs font-bold border border-[#14B8A6]/30">
                {days} Days
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-[#14B8A6] bg-slate-800 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Budget Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Budget Tier
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'budget', label: '💰 Budget', desc: 'Backpacker' },
                { id: 'moderate', label: '⚖️ Moderate', desc: 'Comfort' },
                { id: 'luxury', label: '👑 Luxury', desc: '5-Star' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setBudget(tier.id)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    budget === tier.id
                      ? 'bg-[#14B8A6]/20 border-[#22D3EE] text-white shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <p className="text-xs font-bold">{tier.label}</p>
                  <p className="text-[10px] opacity-75">{tier.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Specific Preferences / Interests (Optional)
            </label>
            <textarea
              rows="2"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g. Foodie, beach lover, avoid crowded spots, vegetarian..."
              className="glass-input w-full px-4 py-3 text-sm text-white placeholder-slate-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!destination.trim()}
              className="glass-button-primary w-full py-3.5 px-6 font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <span>Generate Custom Plan</span>
              <span>➔</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

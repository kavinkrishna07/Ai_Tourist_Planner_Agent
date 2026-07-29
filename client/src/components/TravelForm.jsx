import { useState } from 'react';

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget', desc: 'Hostels, street food, free sights', icon: '🎒' },
  { value: 'moderate', label: 'Moderate', desc: 'Mid-range hotels, mix of dining', icon: '🏠' },
  { value: 'luxury', label: 'Luxury', desc: 'Premium stays, fine dining', icon: '✨' },
];

export default function TravelForm({ onSubmit }) {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState('moderate');
  const [preferences, setPreferences] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ destination, days, budget, preferences });
  }

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-stone-800 mb-3">
          Where will you wander?
        </h2>
        <p className="text-stone-500 text-lg max-w-xl mx-auto">
          Tell us your dream destination and our 10 AI travel agents will craft a personalized itinerary in seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg shadow-amber-100/50 border border-amber-100 p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tokyo, Paris, Bali..."
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20 outline-none transition-all text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Number of days: <span className="text-teal-deep">{days}</span>
            </label>
            <input
              type="range"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-teal-deep"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>1 day</span>
              <span>14 days</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-3">
              Budget level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBudget(opt.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    budget === opt.value
                      ? 'border-amber-warm bg-amber-light/50 shadow-md'
                      : 'border-stone-200 hover:border-amber-200 bg-white'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <p className="font-semibold text-stone-800 mt-1">{opt.label}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Preferences <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <textarea
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g. vegetarian food, museums, hiking, nightlife..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20 outline-none transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-amber-warm to-teal-deep text-white font-semibold text-lg rounded-xl shadow-lg shadow-amber-200/50 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            Plan My Trip ✈️
          </button>
        </div>
      </form>
    </div>
  );
}

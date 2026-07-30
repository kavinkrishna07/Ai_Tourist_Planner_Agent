import { useState, useRef, useEffect } from 'react';
import { MemoryBadge } from './components/MemoryBadge';

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
  'Time Manager': '⏰',
  'Email Agent': '📧',
  'Travel Manager': '✈️',
};

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am WanderWise, your Multi-Agent AI Travel Planner.\nWhere would you like to go and what are your preferences?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgents, setActiveAgents] = useState([]);
  const [userMemory, setUserMemory] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchMemory = async () => {
    try {
      const res = await fetch('/api/memory');
      if (res.ok) {
        const data = await res.json();
        setUserMemory(data);
      }
    } catch (err) {
      console.error('Error fetching user memory:', err);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeAgents]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);
    setActiveAgents(['Memory Agent']);

    const eventSource = new EventSource(`/api/chat?message=${encodeURIComponent(userMessage)}`);

    eventSource.addEventListener('agent_update', (e) => {
      const data = JSON.parse(e.data);
      setActiveAgents(prev => {
        if (!prev.includes(data.agent)) return [...prev, data.agent];
        return prev;
      });
    });

    eventSource.addEventListener('memory_update', (e) => {
      const data = JSON.parse(e.data);
      if (data.preferences) {
        setUserMemory(prev => ({ ...prev, preferences: data.preferences }));
      }
    });

    eventSource.addEventListener('complete', (e) => {
      const data = JSON.parse(e.data);
      setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
      if (data.userMemory) {
        setUserMemory(prev => ({ ...prev, preferences: data.userMemory }));
      }
      setIsLoading(false);
      setActiveAgents([]);
      eventSource.close();
      fetchMemory();
    });

    eventSource.addEventListener('error', (e) => {
      console.error('SSE Error event:', e);
      let displayMsg = '⚠️ **Connection or API Limit Notice**: An error occurred while generating your plan. If you are using a free Groq API key, you may have reached the daily token limit (429). Please update `GROQ_API_KEY` in `.env`.';
      if (e.data) {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.message) displayMsg = parsed.message;
        } catch (_) {}
      }
      setMessages(prev => [...prev, { role: 'assistant', text: displayMsg }]);
      setIsLoading(false);
      setActiveAgents([]);
      eventSource.close();
      fetchMemory();
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/30 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <header className="z-10 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 flex-none px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-teal-500/20">
            ✈️
          </div>
          <div>
            <h1 className="font-sans text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-indigo-300 tracking-tight">WanderWise</h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Multi-Agent Travel Planner</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MemoryBadge memory={userMemory} onRefreshMemory={fetchMemory} />
        </div>
      </header>

      <main className="z-10 flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 fade-in duration-500`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mr-3 mt-1 shrink-0 shadow-md">
                  ✨
                </div>
              )}
              <div className={`max-w-[85%] rounded-3xl p-5 shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-tr-none' 
                  : 'bg-white/10 backdrop-blur-md border border-white/10 text-slate-100 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.text}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-500">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mr-3 mt-1 shrink-0 shadow-md">
                ✨
              </div>
              <div className="max-w-[85%] rounded-3xl p-6 bg-white/5 backdrop-blur-xl border border-white/10 text-slate-100 rounded-tl-none shadow-xl">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-3 text-teal-300 font-medium tracking-wide text-sm">
                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></div>
                    Agents Collaborating...
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {activeAgents.length === 0 && (
                      <span className="text-xs text-slate-400 italic">Travel Manager is thinking...</span>
                    )}
                    {activeAgents.map((agent, i) => (
                      <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-200 text-sm font-semibold border border-indigo-400/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <span>{AGENT_ICONS[agent] || '🤖'}</span>
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      <footer className="z-10 bg-slate-900/60 backdrop-blur-xl border-t border-white/10 p-4 sm:p-6 flex-none">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Where to next? e.g., 5 days in Kyoto for a foodie..."
              className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-slate-400 backdrop-blur-sm transition-all shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:shadow-none flex items-center justify-center"
            >
              Send
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-slate-500 font-medium">
            Powered by 11 specialized AI agents including Memory Agent & MongoDB storage.
          </div>
        </div>
      </footer>
    </div>
  );
}

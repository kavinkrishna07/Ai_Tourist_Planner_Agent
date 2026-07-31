import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MemoryBadge } from './components/MemoryBadge';
import ItineraryDrawer from './components/ItineraryDrawer';
import LoadingState from './components/LoadingState';
import IntroSplashScreen from './components/IntroSplashScreen';
import PaperRocketSVG from './components/PaperRocketSVG';
import AuroraFlightTrail from './components/background/AuroraFlightTrail';

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
  
  // Intro & Drawer States
  const [isIntroComplete, setIsIntroComplete] = useState(() => sessionStorage.getItem('hasSeenIntro') === 'true');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState('');
  const [drawerDest, setDrawerDest] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

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
    setIsCompleted(false);
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
      const resText = data.response || 'Plan calculated.';
      const dest = data.extractedContext?.destination || '';

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: resText, 
        isItinerary: resText.includes('###') || resText.includes('Itinerary'),
        destination: dest,
      }]);

      if (data.userMemory) {
        setUserMemory(prev => ({ ...prev, preferences: data.userMemory }));
      }

      // Prepare drawer content and trigger cinematic completion sequence
      setDrawerContent(resText);
      setDrawerDest(dest);
      setIsCompleted(true);
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

  const openDrawerForMessage = (text, dest) => {
    setDrawerContent(text);
    setDrawerDest(dest || '');
    setDrawerOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden relative">
      
      {/* Intro Cinematic Splash Screen (Runs once per session) */}
      {!isIntroComplete && (
        <IntroSplashScreen onIntroComplete={() => setIsIntroComplete(true)} />
      )}

      {/* Dynamic Single Aurora Flight Trail (Middle-Right to Left) */}
      <AuroraFlightTrail />
      <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-md z-[-2] pointer-events-none" />

      {/* Side Panel Drawer */}
      <ItineraryDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        itineraryText={drawerContent}
        destination={drawerDest}
      />

      {/* Top Navbar Header */}
      <header className="z-10 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 flex-none px-6 py-4 flex items-center justify-between shadow-lg">
        <motion.div 
          className="flex items-center gap-4"
          layoutId="brand-header-container"
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        >
          <motion.div 
            layoutId="brand-logo-icon"
            className="w-12 h-12 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 border border-teal-300/30"
          >
            <PaperRocketSVG className="w-8 h-8 transform -rotate-12" />
          </motion.div>

          <motion.div layoutId="brand-text-container">
            <h1 className="font-sans text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-indigo-300 tracking-tight">
              WanderWise
            </h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Multi-Agent Travel Planner</p>
          </motion.div>
        </motion.div>

        {/* Staggered Navbar Action Controls */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isIntroComplete ? 1 : 0, x: isIntroComplete ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {drawerContent && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold border border-teal-400/30 shadow-md transition-all flex items-center gap-2"
            >
              <PaperRocketSVG className="w-4 h-4 inline transform -rotate-12" />
              <span>Open Side Panel</span>
            </button>
          )}
          <MemoryBadge memory={userMemory} onRefreshMemory={fetchMemory} />
        </motion.div>
      </header>

      {/* Main Chat Interface */}
      <motion.main 
        className="z-10 flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isIntroComplete ? 1 : 0, y: isIntroComplete ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
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
                {msg.isItinerary && (
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <button
                      onClick={() => openDrawerForMessage(msg.text, msg.destination)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 text-white text-xs font-bold shadow-lg hover:brightness-110 transition-all"
                    >
                      <PaperRocketSVG className="w-4 h-4 inline transform -rotate-12" />
                      <span>View Full Itinerary Side Panel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="my-6">
              <LoadingState 
                activeAgents={activeAgents} 
                isCompleted={isCompleted}
                onDeliveryComplete={() => {
                  setIsLoading(false);
                  setActiveAgents([]);
                  setDrawerOpen(true);
                }}
              />
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </motion.main>

      {/* Input Form Footer */}
      <motion.footer 
        className="z-10 bg-slate-900/60 backdrop-blur-xl border-t border-white/10 p-4 sm:p-6 flex-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isIntroComplete ? 1 : 0, y: isIntroComplete ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Where to next? e.g., 5 days in Goa starting mid august..."
              className="flex-1 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-slate-400 backdrop-blur-sm transition-all shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-8 py-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-teal-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <PaperRocketSVG className="w-5 h-5 inline transform -rotate-12" />
            </button>
          </form>
        </div>
      </motion.footer>
    </div>
  );
}

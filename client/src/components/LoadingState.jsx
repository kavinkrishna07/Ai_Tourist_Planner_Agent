import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PaperRocketSVG from './PaperRocketSVG';

const ALL_AGENTS = [
  { name: 'Weather Agent', icon: '🌤️' },
  { name: 'Budget Agent', icon: '💰' },
  { name: 'Route Planner', icon: '🗺️' },
  { name: 'Hotel Agent', icon: '🏨' },
  { name: 'Food Agent', icon: '🍽️' },
  { name: 'Activity Agent', icon: '🎯' },
  { name: 'Time Manager', icon: '⏰' },
  { name: 'Packing Agent', icon: '🧳' },
  { name: 'Safety Agent', icon: '🛡️' },
  { name: 'Local Guide', icon: '🌍' },
  { name: 'Email Agent', icon: '📧' },
];

export default function LoadingState({ activeAgents = [], isCompleted = false, onDeliveryComplete }) {
  const activeSet = new Set(activeAgents);

  // Phases: 'collaborating' | 'connecting' | 'showcase' | 'delivering' | 'done'
  const [phase, setPhase] = useState('collaborating');
  const [connectedIndexes, setConnectedIndexes] = useState([]);
  const [rocketPos, setRocketPos] = useState({ x: 0, y: 0, rotation: 0, scale: 1 });
  const [glowingAgentIndex, setGlowingAgentIndex] = useState(null);

  // Compute ring positions for 11 agents
  const radius = 140;
  const agentPositions = ALL_AGENTS.map((_, i) => {
    const angle = (i / ALL_AGENTS.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  });

  // Start Phase 1 Connection Sequence when isCompleted is true
  useEffect(() => {
    if (isCompleted && phase === 'collaborating') {
      setPhase('connecting');
      let currentIndex = 0;

      const connectStep = () => {
        if (currentIndex < ALL_AGENTS.length) {
          const target = agentPositions[currentIndex];
          const nextAngle = Math.atan2(target.y, target.x) * (180 / Math.PI) + 90;

          // 1. Fly to agent with soft curve
          setRocketPos({
            x: target.x,
            y: target.y,
            rotation: nextAngle,
            scale: 1.1,
          });

          // 2. Pause brief glow (200ms)
          setTimeout(() => {
            setGlowingAgentIndex(currentIndex);
            setConnectedIndexes(prev => [...prev, currentIndex]);

            setTimeout(() => {
              setGlowingAgentIndex(null);
              currentIndex++;
              connectStep();
            }, 180);
          }, 200);
        } else {
          // Phase 2: Finished connecting all. Center showcase for 1 second
          setPhase('showcase');
          setRocketPos({ x: 0, y: -40, rotation: 0, scale: 1.15 });

          setTimeout(() => {
            // Phase 3: Cinematic Delivery Launch Upward
            setPhase('delivering');
            setRocketPos({ x: 0, y: -700, rotation: 0, scale: 1.3 });

            setTimeout(() => {
              setPhase('done');
              if (onDeliveryComplete) onDeliveryComplete();
            }, 1200);
          }, 1100);
        }
      };

      connectStep();
    }
  }, [isCompleted, phase, onDeliveryComplete]);

  if (phase === 'done') return null;

  return (
    <div className="relative py-14 px-6 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl text-center select-none">
      
      {/* Dynamic Main Stage */}
      <div className="relative w-88 h-88 mx-auto flex items-center justify-center">
        
        {/* Soft Background Radial Glow */}
        <div className="absolute inset-0 rounded-full bg-teal-500/10 blur-3xl animate-pulse pointer-events-none" />

        {/* SVG Paper Ribbon / Thread Path Connecting Rocket & Agents */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="-180 -180 360 360">
          <defs>
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="ribbonGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#2dd4bf" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Continuous Stitched Ribbon Line */}
          {connectedIndexes.length > 0 && (
            <motion.path
              d={
                `M 0 0 ` +
                connectedIndexes.map(idx => `L ${agentPositions[idx].x} ${agentPositions[idx].y}`).join(' ') +
                ` L ${rocketPos.x} ${rocketPos.y}`
              }
              fill="none"
              stroke="url(#ribbonGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#ribbonGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}
        </svg>

        {/* Specialist Agent Nodes (All Remain Visible) */}
        {ALL_AGENTS.map((agent, index) => {
          const pos = agentPositions[index];
          const isConnected = connectedIndexes.includes(index);
          const isGlowing = glowingAgentIndex === index;
          const isActive = activeSet.has(agent.name);

          return (
            <motion.div
              key={agent.name}
              className={`absolute w-11 h-11 rounded-full flex items-center justify-center text-lg z-20 transition-colors duration-300 ${
                isGlowing
                  ? 'bg-amber-300 text-slate-900 shadow-[0_0_30px_rgba(251,191,36,0.9)] scale-135 border-2 border-white'
                  : isConnected
                  ? 'bg-gradient-to-tr from-teal-400 to-indigo-500 text-white shadow-[0_0_18px_rgba(45,212,191,0.5)] border-2 border-teal-200'
                  : isActive
                  ? 'bg-indigo-600/90 text-white border border-indigo-400/50 shadow-md animate-pulse'
                  : 'bg-slate-800/80 border border-white/10 text-slate-400 opacity-50'
              }`}
              style={{
                x: pos.x,
                y: pos.y,
              }}
              animate={{
                scale: isGlowing ? 1.35 : isConnected ? 1.1 : 1,
                y: phase === 'delivering' ? pos.y - 700 : pos.y + (phase === 'showcase' ? Math.sin(index) * 4 : 0),
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 14,
                delay: phase === 'delivering' ? index * 0.04 : 0,
              }}
              title={agent.name}
            >
              <span>{agent.icon}</span>
              {isConnected && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-teal-300 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-900">
                  ✓
                </span>
              )}
            </motion.div>
          );
        })}

        {/* The Folded Paper Rocket (Travel Manager AI) */}
        <motion.div
          className="absolute z-30 cursor-pointer"
          animate={{
            x: rocketPos.x,
            y: rocketPos.y,
            rotate: rocketPos.rotation,
            scale: rocketPos.scale,
          }}
          transition={{
            type: "spring",
            stiffness: phase === 'delivering' ? 90 : 150,
            damping: 15,
            mass: 0.8,
          }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-500/30 via-indigo-500/30 to-purple-500/30 flex items-center justify-center shadow-[0_0_45px_rgba(45,212,191,0.4)] border border-teal-300/40 backdrop-blur-md">
            <PaperRocketSVG className="w-16 h-16 transform drop-shadow-xl" />
          </div>
        </motion.div>
      </div>

      {/* Narrative Status Description */}
      <div className="mt-8 space-y-2">
        <h3 className="font-sans text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-indigo-200 to-teal-100 tracking-tight">
          {phase === 'collaborating' && 'Specialist AI Agents Collaborating...'}
          {phase === 'connecting' && 'Stitching Itinerary Paper Ribbon...'}
          {phase === 'showcase' && 'Handcrafted Multi-Agent Itinerary Complete!'}
          {phase === 'delivering' && 'Delivering Full Itinerary...'}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          {phase === 'collaborating' ? (
            activeAgents.length > 0 ? (
              <span className="text-indigo-300 font-medium">Processing: {activeAgents.join(' • ')}</span>
            ) : (
              'Travel Manager is coordinating specialist insights...'
            )
          ) : phase === 'connecting' ? (
            <span className="text-teal-300 font-medium">Connecting each specialist into a unified travel journey...</span>
          ) : (
            <span className="text-teal-200 font-semibold">Unfolding your complete travel plan panel...</span>
          )}
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PaperRocketSVG from './PaperRocketSVG';

export default function IntroSplashScreen({ onIntroComplete }) {
  // Stage 1: Minimal Splash | Stage 2: Typewriter Brand | Stage 3: FLIP Navbar Move | Stage 4: App UI Reveal
  const [stage, setStage] = useState(1);
  const [typedText, setTypedText] = useState('');
  const fullBrandName = 'WanderWise';

  useEffect(() => {
    // Check if intro has already been seen in this session
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro') === 'true';
    if (hasSeenIntro) {
      setStage(4);
      if (onIntroComplete) onIntroComplete();
      return;
    }

    // Stage 1: Minimal Centered Logo Fade In (1.8s)
    const stage1Timer = setTimeout(() => {
      setStage(2);
    }, 1800);

    return () => clearTimeout(stage1Timer);
  }, [onIntroComplete]);

  // Stage 2: Typewriter Brand Name Effect
  useEffect(() => {
    if (stage === 2) {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex <= fullBrandName.length) {
          setTypedText(fullBrandName.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          // Pause 800ms so user appreciates the branding, then move to Stage 3
          setTimeout(() => {
            setStage(3);
            sessionStorage.setItem('hasSeenIntro', 'true');
          }, 850);
        }
      }, 90);

      return () => clearInterval(typeInterval);
    }
  }, [stage]);

  // Stage 3 -> Stage 4 Transition Timing
  useEffect(() => {
    if (stage === 3) {
      const stage3Timer = setTimeout(() => {
        setStage(4);
        if (onIntroComplete) onIntroComplete();
      }, 900);

      return () => clearTimeout(stage3Timer);
    }
  }, [stage, onIntroComplete]);

  if (stage === 4) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center overflow-hidden select-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === 3 ? 0.95 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-teal-500/10 via-indigo-500/10 to-purple-500/10 blur-[130px] rounded-full pointer-events-none" />

        {/* Center Container transforming into Navbar */}
        <motion.div
          className={`flex items-center gap-4 ${
            stage === 3 ? 'absolute top-5 left-6 translate-x-0 translate-y-0 scale-90' : ''
          }`}
          layoutId="brand-header-container"
          transition={{
            type: 'spring',
            stiffness: 90,
            damping: 18,
            mass: 0.9,
          }}
        >
          {/* Centered Folded Paper Rocket Logo */}
          <motion.div
            layoutId="brand-logo-icon"
            className="w-16 h-16 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(45,212,191,0.35)] border border-teal-300/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: stage === 1 ? [-4, 4, -4] : 0,
            }}
            transition={{
              y: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
              opacity: { duration: 0.8 },
              scale: { duration: 0.8 },
            }}
          >
            <PaperRocketSVG className="w-10 h-10 transform -rotate-12 drop-shadow-md" />
          </motion.div>

          {/* Typewriter Brand Text (Appears in Stage 2) */}
          {(stage >= 2) && (
            <motion.div
              layoutId="brand-text-container"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col"
            >
              <h1 className="font-sans text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-indigo-200 to-teal-100 tracking-tight flex items-center">
                <span>{typedText}</span>
                {stage === 2 && typedText.length < fullBrandName.length && (
                  <span className="w-0.5 h-7 bg-teal-400 ml-1 animate-pulse" />
                )}
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-xs text-slate-400 font-medium tracking-widest uppercase"
              >
                AI Multi-Agent Travel Planner
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

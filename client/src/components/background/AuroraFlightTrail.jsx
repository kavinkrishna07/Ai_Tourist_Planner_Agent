import { motion } from 'framer-motion';
import './AuroraFlightTrail.css';

export default function AuroraFlightTrail() {
  return (
    <div className="aurora-trail-container">
      <svg
        className="w-full h-full opacity-95 pointer-events-none"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Luminous High-Visibility Aurora Ribbon Gradient */}
          <linearGradient id="auroraVibrantGrad" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="20%" stopColor="#00ffd1" stopOpacity="1.0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="1.0" />
            <stop offset="80%" stopColor="#818cf8" stopOpacity="1.0" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
          </linearGradient>

          {/* High-Contrast Aurora Glow Filter */}
          <filter id="auroraBrightGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Layer 1: Outer Glowing Aurora Halo */}
        <motion.path
          d="M 1550 420 C 1200 360, 850 500, 500 420 C 250 370, -50 460, -150 420"
          fill="none"
          stroke="url(#auroraVibrantGrad)"
          strokeWidth="32"
          strokeLinecap="round"
          filter="url(#auroraBrightGlow)"
          opacity="0.6"
          animate={{
            d: [
              "M 1550 420 C 1200 360, 850 500, 500 420 C 250 370, -50 460, -150 420",
              "M 1550 450 C 1220 510, 800 360, 470 470 C 220 410, -50 410, -150 450",
              "M 1550 420 C 1200 360, 850 500, 500 420 C 250 370, -50 460, -150 420",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Layer 2: Main Vibrant Aurora Ribbon */}
        <motion.path
          d="M 1550 420 C 1200 360, 850 500, 500 420 C 250 370, -50 460, -150 420"
          fill="none"
          stroke="url(#auroraVibrantGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          filter="url(#auroraBrightGlow)"
          opacity="0.95"
          animate={{
            d: [
              "M 1550 420 C 1200 360, 850 500, 500 420 C 250 370, -50 460, -150 420",
              "M 1550 450 C 1220 510, 800 360, 470 470 C 220 410, -50 410, -150 450",
              "M 1550 420 C 1200 360, 850 500, 500 420 C 250 370, -50 460, -150 420",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Layer 3: Sharp Luminous White Center Light Core */}
        <motion.path
          d="M 1550 420 C 1200 360, 850 500, 500 420 C 250 370, -50 460, -150 420"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.9"
          animate={{
            d: [
              "M 1550 420 C 1200 360, 850 500, 500 420 C 250 370, -50 460, -150 420",
              "M 1550 450 C 1220 510, 800 360, 470 470 C 220 410, -50 410, -150 450",
              "M 1550 420 C 1200 360, 850 500, 500 420 C 250 370, -50 460, -150 420",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
}

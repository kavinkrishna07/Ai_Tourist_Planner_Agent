export default function PaperRocketSVG({ className = "w-20 h-20" }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Paper Gradients for Origami Look */}
        <linearGradient id="paperLeftWing" x1="20" y1="100" x2="100" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#f0fdf4" />
        </linearGradient>

        <linearGradient id="paperRightWing" x1="100" y1="20" x2="180" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>

        <linearGradient id="paperCenterFold" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#99f6e4" />
        </linearGradient>

        <linearGradient id="paperUnderFold" x1="60" y1="140" x2="140" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#115e59" />
        </linearGradient>

        {/* Paper Shadow */}
        <filter id="paperShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter="url(#paperShadow)">
        {/* Bottom Under-Fold Crease */}
        <polygon points="65,145 100,180 135,145 100,130" fill="url(#paperUnderFold)" />

        {/* Left Wing Main Fold */}
        <polygon points="100,20 15,120 100,140" fill="url(#paperLeftWing)" />

        {/* Right Wing Main Fold */}
        <polygon points="100,20 185,120 100,140" fill="url(#paperRightWing)" />

        {/* Center Ridge / Nose Fold */}
        <polygon points="100,20 95,140 100,180 105,140" fill="url(#paperCenterFold)" opacity="0.9" />

        {/* Fold Crease Lines (Dotted / Thin Origami Guide Lines) */}
        <line x1="100" y1="20" x2="100" y2="180" stroke="#0d9488" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
        <line x1="100" y1="20" x2="55" y2="70" stroke="#0d9488" strokeWidth="1.5" opacity="0.4" />
        <line x1="100" y1="20" x2="145" y2="70" stroke="#0d9488" strokeWidth="1.5" opacity="0.4" />

        {/* Origami Corner Fold Tips */}
        <polygon points="15,120 40,110 100,140" fill="#14b8a6" opacity="0.7" />
        <polygon points="185,120 160,110 100,140" fill="#0f766e" opacity="0.7" />
      </g>
    </svg>
  );
}

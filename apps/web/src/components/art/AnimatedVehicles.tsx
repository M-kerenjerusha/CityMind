import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedWindTurbine: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 48,
}) => (
  <div className={`relative inline-block ${className}`} style={{ width: size, height: size * 1.5 }}>
    <svg viewBox="0 0 60 90" className="w-full h-full drop-shadow-md">
      {/* Tower Pole */}
      <polygon points="28,35 32,35 34,90 26,90" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
      {/* Base Mount */}
      <ellipse cx="30" cy="88" rx="8" ry="2.5" fill="#64748b" />
      {/* Nacelle Center */}
      <circle cx="30" cy="35" r="4" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
      {/* Spinning Blades */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '30px', originY: '35px' }}
      >
        {/* Blade 1 (Up) */}
        <path d="M30 35 Q32 15 30 2 Q28 15 30 35 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Blade 2 (Down Right) */}
        <path d="M30 35 Q48 45 58 52 Q42 48 30 35 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
        {/* Blade 3 (Down Left) */}
        <path d="M30 35 Q12 45 2 52 Q18 48 30 35 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
        <circle cx="30" cy="35" r="2.5" fill="#38bdf8" />
      </motion.g>
    </svg>
  </div>
);

export const AnimatedElectricBus: React.FC<{ className?: string }> = ({ className = '' }) => (
  <motion.div
    animate={{ x: [-80, 1000] }}
    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    className={`absolute pointer-events-none z-10 ${className}`}
  >
    <div className="relative w-20 h-10 drop-shadow-lg">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Bus Body */}
        <rect x="5" y="8" width="85" height="30" rx="8" fill="#10b981" stroke="#064e3b" strokeWidth="2" />
        {/* Roof Solar / Battery Pack */}
        <rect x="20" y="3" width="55" height="5" rx="2" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
        <text x="47" y="7" fontSize="3" fontWeight="bold" fill="#ffffff" textAnchor="middle">100% ELECTRIC</text>
        {/* Windows */}
        <rect x="12" y="14" width="14" height="11" rx="2" fill="#e0f2fe" stroke="#0369a1" strokeWidth="1" />
        <rect x="30" y="14" width="14" height="11" rx="2" fill="#e0f2fe" stroke="#0369a1" strokeWidth="1" />
        <rect x="48" y="14" width="14" height="11" rx="2" fill="#e0f2fe" stroke="#0369a1" strokeWidth="1" />
        <rect x="66" y="14" width="14" height="11" rx="2" fill="#e0f2fe" stroke="#0369a1" strokeWidth="1" />
        {/* Headlight */}
        <polygon points="90,26 95,28 90,32" fill="#facc15" />
        {/* Wheels with rotation */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '25px', originY: '38px' }}
        >
          <circle cx="25" cy="38" r="7" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
          <circle cx="25" cy="38" r="2.5" fill="#64748b" />
        </motion.g>
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '72px', originY: '38px' }}
        >
          <circle cx="72" cy="38" r="7" fill="#0f172a" stroke="#ffffff" strokeWidth="2" />
          <circle cx="72" cy="38" r="2.5" fill="#64748b" />
        </motion.g>
      </svg>
    </div>
  </motion.div>
);

export const AnimatedEcoDrone: React.FC<{ className?: string }> = ({ className = '' }) => (
  <motion.div
    animate={{
      x: [0, 150, 0],
      y: [0, -25, 0],
      rotate: [-3, 5, -3],
    }}
    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    className={`absolute pointer-events-none z-20 ${className}`}
  >
    <div className="relative w-14 h-12 drop-shadow-md">
      <svg viewBox="0 0 60 50" className="w-full h-full">
        {/* Propellers */}
        <motion.ellipse
          cx="14"
          cy="12"
          rx="12"
          ry="2"
          fill="#38bdf8"
          animate={{ scaleX: [1, 0.2, 1] }}
          transition={{ duration: 0.15, repeat: Infinity }}
        />
        <motion.ellipse
          cx="46"
          cy="12"
          rx="12"
          ry="2"
          fill="#38bdf8"
          animate={{ scaleX: [1, 0.2, 1] }}
          transition={{ duration: 0.15, repeat: Infinity }}
        />
        {/* Frame Arms */}
        <line x1="14" y1="12" x2="30" y2="24" stroke="#334155" strokeWidth="2.5" />
        <line x1="46" y1="12" x2="30" y2="24" stroke="#334155" strokeWidth="2.5" />
        {/* Drone Center Pod */}
        <circle cx="30" cy="24" r="9" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="30" cy="24" r="5" fill="#38bdf8" />
        <circle cx="32" cy="23" r="1.5" fill="#ffffff" />
        {/* Suspended Green Battery Cargo */}
        <line x1="26" y1="33" x2="26" y2="38" stroke="#64748b" strokeWidth="1" />
        <line x1="34" y1="33" x2="34" y2="38" stroke="#64748b" strokeWidth="1" />
        <rect x="22" y="38" width="16" height="10" rx="2" fill="#10b981" stroke="#064e3b" strokeWidth="1" />
        <text x="30" y="45" fontSize="5" fontWeight="bold" fill="#ffffff" textAnchor="middle">⚡</text>
      </svg>
    </div>
  </motion.div>
);

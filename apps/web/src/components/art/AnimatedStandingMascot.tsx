import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../../services/sound';
import { Sparkles, MessageCircle } from 'lucide-react';

interface AnimatedStandingMascotProps {
  className?: string;
  onStartClick?: () => void;
}

const QUOTES = [
  "Hey Mayor! Tap START GAME to begin our city campaign!",
  "Level 1: Old Town is facing power blackouts! We need your leadership!",
  "Hoot! Did you know rooftop solar pays for itself in just 3 months?",
  "Careful with transit! Building roads adds smog, but buses clear it!",
  "Collect 3 stars on every level to unlock the Gold Mayor Trophy! 🏆",
];

export const AnimatedStandingMascot: React.FC<AnimatedStandingMascotProps> = ({
  className = '',
  onStartClick,
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isWaving, setIsWaving] = useState(true);

  const handleMascotClick = () => {
    soundManager.playClick();
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    setIsWaving(true);
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Floating Animated Speech Bubble */}
      <motion.div
        key={quoteIndex}
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 14 }}
        onClick={handleMascotClick}
        className="cursor-pointer max-w-[240px] sm:max-w-[280px] mb-3 bg-white text-slate-900 border-3 border-slate-900 p-3 sm:p-4 rounded-3xl shadow-cartoon relative pointer-events-auto hover:scale-105 transition-transform"
      >
        <div className="flex items-start gap-2">
          <span className="text-xl">🦉</span>
          <p className="text-xs sm:text-sm font-black leading-snug">
            {QUOTES[quoteIndex]}
          </p>
        </div>
        <div className="text-[10px] text-emerald-700 font-extrabold mt-1 text-right flex items-center justify-end gap-1">
          <span>Tap me for tips</span>
          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
        </div>

        {/* Speech Bubble Arrow pointing down to mascot */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900" />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-7 border-x-transparent border-t-7 border-t-white" />
      </motion.div>

      {/* Interactive Standing Character Canvas */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95, y: 6 }}
        onClick={handleMascotClick}
        className="relative cursor-pointer group"
      >
        {/* Floating Sparkles & Stars */}
        <motion.div
          animate={{
            y: [-4, 4, -4],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-3 -right-2 z-20 pointer-events-none"
        >
          <span className="text-2xl drop-shadow">✨</span>
        </motion.div>

        <motion.div
          animate={{
            y: [4, -4, 4],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-12 -left-4 z-20 pointer-events-none"
        >
          <span className="text-xl drop-shadow">🌱</span>
        </motion.div>

        {/* Full-Body SVG Mascot: Mayor Mira with Mayoral Sash and Waving Arm */}
        <motion.div
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-32 h-44 sm:w-40 sm:h-52 drop-shadow-[0_12px_12px_rgba(0,0,0,0.4)]"
        >
          <svg viewBox="0 0 160 210" className="w-full h-full overflow-visible">
            {/* Ground Contact Shadow */}
            <ellipse cx="80" cy="202" rx="42" ry="7" fill="rgba(15,23,42,0.35)" />

            {/* Feet / Polished Shoes */}
            <ellipse cx="64" cy="196" rx="14" ry="7" fill="#0f172a" />
            <ellipse cx="96" cy="196" rx="14" ry="7" fill="#0f172a" />
            <ellipse cx="62" cy="194" rx="12" ry="5" fill="#334155" />
            <ellipse cx="94" cy="194" rx="12" ry="5" fill="#334155" />

            {/* Smart Dress Pants / Suit Legs */}
            <path d="M52 145 L74 145 L72 192 L54 192 Z" fill="#065f46" stroke="#022c22" strokeWidth="2.5" />
            <path d="M86 145 L108 145 L106 192 L88 192 Z" fill="#065f46" stroke="#022c22" strokeWidth="2.5" />

            {/* Torso / Blazer Jacket */}
            <path
              d="M44 85 Q80 80 116 85 L124 148 Q80 156 36 148 Z"
              fill="#059669"
              stroke="#022c22"
              strokeWidth="3"
            />
            {/* Inner White Shirt & Tie */}
            <polygon points="80,85 70,115 90,115" fill="#ffffff" />
            <polygon points="80,95 76,120 84,120" fill="#f59e0b" />

            {/* Golden Mayoral Sash */}
            <path
              d="M52 85 L118 145 L104 150 L42 92 Z"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="2"
            />
            {/* Mayoral Star Seal on Sash */}
            <circle cx="95" cy="132" r="7" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
            <text x="95" y="135" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#ffffff">★</text>

            {/* Left Arm: Holding Clipboard */}
            <g>
              <path
                d="M44 92 L28 125 L40 135 L52 105 Z"
                fill="#059669"
                stroke="#022c22"
                strokeWidth="2.5"
              />
              {/* Hand */}
              <circle cx="28" cy="128" r="7" fill="#fde68a" stroke="#022c22" strokeWidth="2" />
              {/* Wooden Clipboard */}
              <rect
                x="14"
                y="115"
                width="20"
                height="28"
                rx="3"
                transform="rotate(-15 24 129)"
                fill="#b45309"
                stroke="#022c22"
                strokeWidth="2"
              />
              <rect
                x="16"
                y="118"
                width="16"
                height="22"
                rx="2"
                transform="rotate(-15 24 129)"
                fill="#f8fafc"
              />
              <line x1="18" y1="123" x2="28" y2="120" stroke="#10b981" strokeWidth="2" transform="rotate(-15 24 129)" />
              <line x1="18" y1="128" x2="28" y2="125" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(-15 24 129)" />
            </g>

            {/* Right Arm: Waving Hello! */}
            <motion.g
              animate={
                isWaving
                  ? {
                      rotate: [0, -22, 6, -22, 0],
                    }
                  : {}
              }
              transition={{
                duration: 1.6,
                repeat: Infinity,
                repeatDelay: 1,
                ease: 'easeInOut',
              }}
              style={{ originX: '116px', originY: '92px' }}
            >
              <path
                d="M116 92 L140 70 L148 78 L124 105 Z"
                fill="#059669"
                stroke="#022c22"
                strokeWidth="2.5"
              />
              {/* Waving Hand */}
              <circle cx="145" cy="68" r="8" fill="#fde68a" stroke="#022c22" strokeWidth="2" />
              {/* Fingers */}
              <circle cx="148" cy="62" r="3" fill="#fde68a" />
              <circle cx="152" cy="65" r="3" fill="#fde68a" />
              <circle cx="152" cy="71" r="3" fill="#fde68a" />
            </motion.g>

            {/* Neck */}
            <rect x="73" y="74" width="14" height="15" fill="#fde68a" stroke="#022c22" strokeWidth="2" />

            {/* Hair Back */}
            <path
              d="M48 60 C42 22 118 22 112 60 C112 78 104 85 104 85 L56 85 Z"
              fill="#475569"
              stroke="#0f172a"
              strokeWidth="2.5"
            />

            {/* Head / Face */}
            <circle cx="80" cy="54" r="28" fill="#fde68a" stroke="#022c22" strokeWidth="3" />

            {/* Hair Front Bangs */}
            <path
              d="M52 45 Q80 28 108 45 Q80 36 52 45 Z"
              fill="#334155"
            />

            {/* Eyebrows */}
            <path d="M64 42 Q72 38 76 43" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M84 43 Q88 38 96 42" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Animated Blinking Eyes */}
            <motion.g
              animate={{
                scaleY: [1, 1, 0.1, 1, 1],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                times: [0, 0.45, 0.5, 0.55, 1],
              }}
              style={{ originY: '50px' }}
            >
              <ellipse cx="70" cy="50" rx="4.5" ry="5.5" fill="#0f172a" />
              <ellipse cx="90" cy="50" rx="4.5" ry="5.5" fill="#0f172a" />
              {/* Eye Catchlights */}
              <circle cx="68" cy="48" r="1.8" fill="#ffffff" />
              <circle cx="88" cy="48" r="1.8" fill="#ffffff" />
            </motion.g>

            {/* Blushing Cheeks */}
            <circle cx="63" cy="58" r="3.5" fill="#f87171" opacity="0.6" />
            <circle cx="97" cy="58" r="3.5" fill="#f87171" opacity="0.6" />

            {/* Cute Smile */}
            <path
              d="M72 63 Q80 72 88 63"
              stroke="#b91c1c"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />

            {/* Mayor Golden Pin on Lapel */}
            <polygon points="56,100 58,106 64,106 59,110 61,116 56,112 51,116 53,110 48,106 54,106" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

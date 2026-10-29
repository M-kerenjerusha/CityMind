import React from 'react';

interface CitizenSpriteProps {
  happiness: number; // 0 - 100
  variant?: 1 | 2 | 3;
  className?: string;
}

export const CitizenSprite: React.FC<CitizenSpriteProps> = ({
  happiness,
  variant = 1,
  className = '',
}) => {
  const isHappy = happiness >= 60;
  const isAngry = happiness < 45;

  const shirtColor = variant === 1 ? '#3b82f6' : variant === 2 ? '#ec4899' : '#10b981';

  return (
    <div className={`relative inline-block w-8 h-10 animate-bob ${className}`}>
      <svg viewBox="0 0 40 50" className="w-full h-full drop-shadow">
        {/* Mood Bubble Aura */}
        <circle
          cx="20"
          cy="12"
          r="10"
          fill={isHappy ? '#86efac' : isAngry ? '#fca5a5' : '#fef08a'}
          opacity="0.3"
        />

        {/* Head */}
        <circle cx="20" cy="14" r="7" fill="#fde68a" stroke="#1e293b" strokeWidth="1" />

        {/* Hair */}
        {variant === 1 ? (
          <path d="M14 12 Q20 7 26 12" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" />
        ) : (
          <path d="M13 14 C13 8 27 8 27 14" fill="#78350f" />
        )}

        {/* Eyes */}
        <circle cx="17.5" cy="13.5" r="1" fill="#1e293b" />
        <circle cx="22.5" cy="13.5" r="1" fill="#1e293b" />

        {/* Animated Mood Mouth */}
        {isHappy ? (
          // Big smile
          <path d="M17 16 Q20 19 23 16" stroke="#15803d" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        ) : isAngry ? (
          // Frown
          <path d="M17 18 Q20 15 23 18" stroke="#b91c1c" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        ) : (
          // Neutral line
          <line x1="18" y1="17" x2="22" y2="17" stroke="#854d0e" strokeWidth="1.2" strokeLinecap="round" />
        )}

        {/* Body / Shirt */}
        <path d="M14 22 L26 22 L24 35 L16 35 Z" fill={shirtColor} stroke="#1e293b" strokeWidth="1" />

        {/* Legs */}
        <line x1="17" y1="35" x2="16" y2="44" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        <line x1="23" y1="35" x2="24" y2="44" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};

import React from 'react';

interface NpcAvatarProps {
  id: 'mira' | 'volt' | 'zoom' | 'rina' | 'penny' | 'blaze' | 'gemi' | string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const NpcAvatar: React.FC<NpcAvatarProps> = ({
  id,
  size = 'md',
  className = '',
  animate = true,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size];

  const animClass = animate ? 'animate-bob' : '';

  // 1. Mayor Mira: Emerald suit, warm smile, smart silver hair, sash
  if (id === 'mira' || id === 'mayor_1') {
    return (
      <div className={`relative inline-block ${sizeClasses} ${animClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <circle cx="50" cy="50" r="46" fill="#10b981" />
          <circle cx="50" cy="50" r="42" fill="#d1fae5" />
          {/* Hair back */}
          <path d="M26 48 C24 22 76 22 74 48 C74 58 68 64 68 64 L32 64 Z" fill="#64748b" />
          {/* Face */}
          <circle cx="50" cy="48" r="22" fill="#fde68a" />
          {/* Hair front bangs */}
          <path d="M30 38 Q50 26 70 38 Q50 32 30 38 Z" fill="#475569" />
          {/* Eyes with friendly blink */}
          <circle cx="43" cy="46" r="3" fill="#1e293b" />
          <circle cx="57" cy="46" r="3" fill="#1e293b" />
          {/* Smile */}
          <path d="M43 56 Q50 63 57 56" stroke="#b91c1c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="39" cy="53" r="2.5" fill="#f87171" opacity="0.6" />
          <circle cx="61" cy="53" r="2.5" fill="#f87171" opacity="0.6" />
          {/* Mayor Sash */}
          <path d="M32 78 L68 78 L60 92 L40 92 Z" fill="#047857" />
          <path d="M38 78 L58 92" stroke="#fbbf24" strokeWidth="4" />
        </svg>
      </div>
    );
  }

  // 2. Professor Volt: Quirky scientist goggles, electric blue tie, wild white hair
  if (id === 'volt') {
    return (
      <div className={`relative inline-block ${sizeClasses} ${animClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <circle cx="50" cy="50" r="46" fill="#0284c7" />
          <circle cx="50" cy="50" r="42" fill="#e0f2fe" />
          {/* Electric hair spikes */}
          <path d="M20 40 L30 20 L40 30 L50 15 L60 30 L70 20 L80 40 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Face */}
          <circle cx="50" cy="52" r="21" fill="#fed7aa" />
          {/* Tech Goggles */}
          <rect x="34" y="44" width="14" height="12" rx="4" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.5" />
          <rect x="52" y="44" width="14" height="12" rx="4" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.5" />
          <line x1="48" y1="50" x2="52" y2="50" stroke="#0369a1" strokeWidth="3" />
          <circle cx="41" cy="50" r="2" fill="#ffffff" />
          <circle cx="59" cy="50" r="2" fill="#ffffff" />
          {/* Cheerful grin */}
          <path d="M44 60 Q50 67 56 60" stroke="#9a3412" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Lab coat & lightning bolt badge */}
          <path d="M30 76 L70 76 L66 92 L34 92 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          <polygon points="50,77 47,84 51,84 49,90 54,83 50,83" fill="#eab308" />
        </svg>
      </div>
    );
  }

  // 3. Captain Zoom: Transit visor, driver cap, swift orange jacket
  if (id === 'zoom') {
    return (
      <div className={`relative inline-block ${sizeClasses} ${animClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <circle cx="50" cy="50" r="46" fill="#f97316" />
          <circle cx="50" cy="50" r="42" fill="#ffedd5" />
          {/* Face */}
          <circle cx="50" cy="52" r="21" fill="#fcd34d" />
          {/* Transit Cap */}
          <path d="M26 44 Q50 30 74 44 L78 40 Q50 20 22 40 Z" fill="#1e3a8a" />
          <ellipse cx="50" cy="42" rx="26" ry="6" fill="#1e40af" />
          {/* Visor glasses */}
          <path d="M35 48 H65 V55 H35 Z" fill="#0f172a" rx="3" />
          <line x1="38" y1="51" x2="48" y2="51" stroke="#38bdf8" strokeWidth="2" />
          <line x1="52" y1="51" x2="62" y2="51" stroke="#38bdf8" strokeWidth="2" />
          {/* Confident smile */}
          <path d="M43 62 Q50 66 57 62" stroke="#7c2d12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* High-vis jacket */}
          <path d="M30 76 L70 76 L66 92 L34 92 Z" fill="#ea580c" />
          <rect x="42" y="76" width="16" height="16" fill="#facc15" />
        </svg>
      </div>
    );
  }

  // 4. Rina the Recycler: Green bandana, bright braided hair, compost leaf badge
  if (id === 'rina') {
    return (
      <div className={`relative inline-block ${sizeClasses} ${animClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <circle cx="50" cy="50" r="46" fill="#84cc16" />
          <circle cx="50" cy="50" r="42" fill="#ecfccb" />
          {/* Hair curly brown */}
          <circle cx="32" cy="46" r="12" fill="#78350f" />
          <circle cx="68" cy="46" r="12" fill="#78350f" />
          {/* Face */}
          <circle cx="50" cy="50" r="21" fill="#fed7aa" />
          {/* Green Bandana */}
          <path d="M28 42 Q50 30 72 42 L68 36 Q50 26 32 36 Z" fill="#15803d" />
          {/* Eyes */}
          <circle cx="43" cy="48" r="3" fill="#1e293b" />
          <circle cx="57" cy="48" r="3" fill="#1e293b" />
          {/* Dimples smile */}
          <path d="M43 58 Q50 64 57 58" stroke="#9a3412" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Overalls */}
          <path d="M30 76 L70 76 L66 92 L34 92 Z" fill="#166534" />
          {/* Recycle emblem */}
          <circle cx="50" cy="84" r="5" fill="#a3e635" />
        </svg>
      </div>
    );
  }

  // 5. Penny the Treasurer: Round glasses, neat bob cut, coin necklace, ledger vest
  if (id === 'penny') {
    return (
      <div className={`relative inline-block ${sizeClasses} ${animClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <circle cx="50" cy="50" r="46" fill="#eab308" />
          <circle cx="50" cy="42" r="42" fill="#fef9c3" />
          {/* Auburn Hair */}
          <path d="M28 50 C26 26 74 26 72 50 C72 60 70 65 68 65 L32 65 Z" fill="#b45309" />
          {/* Face */}
          <circle cx="50" cy="50" r="20" fill="#fed7aa" />
          {/* Round wire glasses */}
          <circle cx="42" cy="48" r="6" stroke="#78350f" strokeWidth="2" fill="#ffffff" fillOpacity="0.4" />
          <circle cx="58" cy="48" r="6" stroke="#78350f" strokeWidth="2" fill="#ffffff" fillOpacity="0.4" />
          <line x1="48" y1="48" x2="52" y2="48" stroke="#78350f" strokeWidth="2" />
          <circle cx="42" cy="48" r="2" fill="#1e293b" />
          <circle cx="58" cy="48" r="2" fill="#1e293b" />
          {/* Prudent smile */}
          <path d="M45 58 Q50 62 55 58" stroke="#9a3412" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Vest with gold coin medal */}
          <path d="M32 74 L68 74 L64 92 L36 92 Z" fill="#78350f" />
          <circle cx="50" cy="80" r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  // 6. Chief Blaze: Firefighter helmet with golden badge, resolute chin, protective turnout coat
  if (id === 'blaze') {
    return (
      <div className={`relative inline-block ${sizeClasses} ${animClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <circle cx="50" cy="50" r="46" fill="#e11d48" />
          <circle cx="50" cy="50" r="42" fill="#ffe4e6" />
          {/* Face */}
          <circle cx="50" cy="54" r="21" fill="#fcd34d" />
          {/* Fire Chief Helmet */}
          <path d="M22 46 C22 24 78 24 78 46 L84 50 L16 50 Z" fill="#b91c1c" />
          <rect x="42" y="30" width="16" height="14" rx="2" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />
          <text x="50" y="41" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#78350f">C</text>
          {/* Stern resolute eyes */}
          <path d="M39 49 L46 51" stroke="#1e293b" strokeWidth="2" />
          <path d="M61 49 L54 51" stroke="#1e293b" strokeWidth="2" />
          <circle cx="42" cy="53" r="2.5" fill="#1e293b" />
          <circle cx="58" cy="53" r="2.5" fill="#1e293b" />
          {/* Determined mouth */}
          <line x1="44" y1="63" x2="56" y2="63" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" />
          {/* Turnout Jacket with reflective yellow stripes */}
          <path d="M28 76 L72 76 L68 92 L32 92 Z" fill="#1e293b" />
          <line x1="30" y1="84" x2="70" y2="84" stroke="#facc15" strokeWidth="3" />
        </svg>
      </div>
    );
  }

  // 7. Gemi the Owl: Wise cartoon owl, graduation cap, big golden eyes, feather tufts
  return (
    <div className={`relative inline-block ${sizeClasses} ${animClass} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Glow */}
        <circle cx="50" cy="50" r="46" fill="#8b5cf6" />
        <circle cx="50" cy="50" r="42" fill="#ede9fe" />
        {/* Owl Ear Tufts */}
        <polygon points="32,24 40,40 24,36" fill="#7c3aed" />
        <polygon points="68,24 60,40 76,36" fill="#7c3aed" />
        {/* Owl Body */}
        <ellipse cx="50" cy="55" rx="28" ry="30" fill="#6d28d9" />
        {/* Breast feathers */}
        <ellipse cx="50" cy="65" rx="18" ry="18" fill="#ddd6fe" />
        {/* Feather scallops */}
        <path d="M42 62 Q46 66 50 62 Q54 66 58 62" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
        <path d="M44 70 Q48 74 52 70 Q56 74 60 70" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
        {/* Big Owl Eyes */}
        <circle cx="38" cy="46" r="12" fill="#fef08a" stroke="#4c1d95" strokeWidth="2" />
        <circle cx="62" cy="46" r="12" fill="#fef08a" stroke="#4c1d95" strokeWidth="2" />
        {/* Pupils with smart sparkle */}
        <circle cx="39" cy="46" r="6" fill="#1e1b4b" />
        <circle cx="61" cy="46" r="6" fill="#1e1b4b" />
        <circle cx="37" cy="44" r="2" fill="#ffffff" />
        <circle cx="59" cy="44" r="2" fill="#ffffff" />
        {/* Small orange beak */}
        <polygon points="50,50 46,56 54,56" fill="#f97316" />
        {/* Tiny graduation mortarboard or star crest */}
        <polygon points="50,16 66,22 50,28 34,22" fill="#1e1b4b" />
        <line x1="66" y1="22" x2="68" y2="30" stroke="#facc15" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

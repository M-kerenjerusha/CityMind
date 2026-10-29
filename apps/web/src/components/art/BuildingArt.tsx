import React from 'react';

interface BuildingArtProps {
  type:
    | 'power_plant'
    | 'transit_station'
    | 'recycling_center'
    | 'city_hall'
    | 'crisis_tower'
    | 'market'
    | 'badge_hall'
    | 'treehouse';
  className?: string;
}

export const BuildingArt: React.FC<BuildingArtProps> = ({ type, className = '' }) => {
  // 1. Power Plant (Helios Clean Energy Hub)
  if (type === 'power_plant') {
    return (
      <svg viewBox="0 0 120 120" className={`w-full h-full drop-shadow-xl ${className}`}>
        {/* Base Platform */}
        <polygon points="10,95 60,115 110,95 60,75" fill="#334155" />
        <polygon points="10,95 60,115 60,118 10,98" fill="#1e293b" />
        <polygon points="60,115 110,95 110,98 60,118" fill="#0f172a" />
        {/* Modern Clean Turbine Spire */}
        <path d="M42,40 L48,85 L72,85 L78,40 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
        {/* Cooling Top Vent with clean steam puffs */}
        <ellipse cx="60" cy="40" rx="18" ry="6" fill="#0284c7" />
        {/* Solar Arrays on ground */}
        <polygon points="18,80 40,72 48,84 26,92" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
        <polygon points="72,84 94,76 102,88 80,96" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
        {/* Battery Bank Storage Box */}
        <rect x="52" y="70" width="16" height="15" rx="3" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
        {/* Electric Bolt Icon */}
        <polygon points="60,72 57,78 61,78 59,83 64,77 60,77" fill="#facc15" />
      </svg>
    );
  }

  // 2. Transit Station (Metro Central)
  if (type === 'transit_station') {
    return (
      <svg viewBox="0 0 120 120" className={`w-full h-full drop-shadow-xl ${className}`}>
        {/* Base */}
        <polygon points="10,95 60,115 110,95 60,75" fill="#475569" />
        {/* Terminal Canopy */}
        <path d="M25,65 Q60,45 95,65 L90,85 Q60,70 30,85 Z" fill="#0ea5e9" stroke="#0284c7" strokeWidth="2" />
        <polygon points="30,85 90,85 90,92 30,92" fill="#0369a1" />
        {/* Glass Windows */}
        <rect x="40" y="68" width="40" height="12" rx="2" fill="#bae6fd" opacity="0.8" />
        {/* Electric Rapid Bus Sprite */}
        <rect x="35" y="86" width="30" height="14" rx="4" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
        <rect x="38" y="88" width="6" height="5" rx="1" fill="#e0f2fe" />
        <rect x="46" y="88" width="6" height="5" rx="1" fill="#e0f2fe" />
        <rect x="54" y="88" width="6" height="5" rx="1" fill="#e0f2fe" />
        <circle cx="42" cy="100" r="3" fill="#1e293b" />
        <circle cx="58" cy="100" r="3" fill="#1e293b" />
        {/* Transit Clock Spire */}
        <line x1="60" y1="48" x2="60" y2="30" stroke="#f97316" strokeWidth="3" />
        <circle cx="60" cy="28" r="6" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
      </svg>
    );
  }

  // 3. Recycling Center (EcoCycle Hub)
  if (type === 'recycling_center') {
    return (
      <svg viewBox="0 0 120 120" className={`w-full h-full drop-shadow-xl ${className}`}>
        {/* Base */}
        <polygon points="10,95 60,115 110,95 60,75" fill="#3f6212" />
        {/* Circular sorting warehouse */}
        <ellipse cx="60" cy="75" rx="35" ry="18" fill="#84cc16" stroke="#4d7c0f" strokeWidth="2" />
        <path d="M25,75 C25,50 95,50 95,75 Z" fill="#65a30d" stroke="#4d7c0f" strokeWidth="2" />
        {/* Glass Greenhouse Roof Skylight */}
        <ellipse cx="60" cy="62" rx="20" ry="10" fill="#bef264" opacity="0.7" />
        {/* Giant Recycling Arrows Icon */}
        <circle cx="60" cy="40" r="14" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
        <path d="M54,36 L64,36 L61,32" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M66,42 L61,48 L65,49" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M54,46 L55,40 L51,42" stroke="#16a34a" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Sorting Bins */}
        <rect x="25" y="85" width="12" height="12" rx="2" fill="#22c55e" />
        <rect x="40" y="87" width="12" height="12" rx="2" fill="#3b82f6" />
        <rect x="80" y="85" width="12" height="12" rx="2" fill="#eab308" />
      </svg>
    );
  }

  // 4. City Hall (Council Chamber)
  if (type === 'city_hall') {
    return (
      <svg viewBox="0 0 120 120" className={`w-full h-full drop-shadow-xl ${className}`}>
        {/* Steps Base */}
        <polygon points="10,98 60,116 110,98 60,80" fill="#64748b" />
        <polygon points="18,92 60,108 102,92 60,76" fill="#94a3b8" />
        {/* Neo-classical columns */}
        <rect x="30" y="55" width="6" height="30" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <rect x="46" y="55" width="6" height="30" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <rect x="68" y="55" width="6" height="30" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <rect x="84" y="55" width="6" height="30" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        {/* Pediment triangle */}
        <polygon points="25,55 95,55 60,35" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
        {/* Gold Mayor Dome */}
        <path d="M44,35 Q60,15 76,35 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="1.5" />
        {/* Flag Pole */}
        <line x1="60" y1="20" x2="60" y2="8" stroke="#94a3b8" strokeWidth="2" />
        <polygon points="60,8 74,13 60,18" fill="#10b981" />
      </svg>
    );
  }

  // 5. Crisis Tower (Command Spire)
  if (type === 'crisis_tower') {
    return (
      <svg viewBox="0 0 120 120" className={`w-full h-full drop-shadow-xl ${className}`}>
        {/* Armored Base */}
        <polygon points="15,95 60,115 105,95 60,75" fill="#1e293b" />
        {/* Fortified Spire Tower */}
        <polygon points="45,45 75,45 78,85 42,85" fill="#334155" stroke="#0f172a" strokeWidth="2" />
        {/* Red Warning Stripes */}
        <line x1="43" y1="75" x2="77" y2="75" stroke="#ef4444" strokeWidth="3" />
        <line x1="44" y1="65" x2="76" y2="65" stroke="#ef4444" strokeWidth="3" />
        {/* Command Observation Deck */}
        <ellipse cx="60" cy="45" rx="22" ry="7" fill="#475569" stroke="#1e293b" strokeWidth="2" />
        {/* Glowing Radar Dome */}
        <circle cx="60" cy="34" r="10" fill="#0284c7" />
        {/* Emergency Beacon Light with flashing ray */}
        <circle cx="60" cy="20" r="5" fill="#ef4444" />
        <line x1="60" y1="12" x2="60" y2="8" stroke="#f87171" strokeWidth="2" />
        <line x1="52" y1="16" x2="48" y2="12" stroke="#f87171" strokeWidth="2" />
        <line x1="68" y1="16" x2="72" y2="12" stroke="#f87171" strokeWidth="2" />
      </svg>
    );
  }

  // 6. Green Credits Market (Bazaar)
  if (type === 'market') {
    return (
      <svg viewBox="0 0 120 120" className={`w-full h-full drop-shadow-xl ${className}`}>
        <polygon points="15,95 60,115 105,95 60,75" fill="#475569" />
        {/* Canopy with striped awnings */}
        <path d="M25,65 Q60,48 95,65 L88,78 Q60,65 32,78 Z" fill="#10b981" />
        <polygon points="32,78 45,78 42,70 30,70" fill="#ecfdf5" />
        <polygon points="55,78 68,78 65,70 52,70" fill="#ecfdf5" />
        <polygon points="78,78 88,78 85,70 75,70" fill="#ecfdf5" />
        {/* Market Stalls */}
        <rect x="34" y="78" width="52" height="18" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
        {/* Coin Medal Sign */}
        <circle cx="60" cy="42" r="10" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
        <text x="60" y="46" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#78350f">$</text>
      </svg>
    );
  }

  // 7. Badge Hall (Trophy Pavilion)
  if (type === 'badge_hall') {
    return (
      <svg viewBox="0 0 120 120" className={`w-full h-full drop-shadow-xl ${className}`}>
        <polygon points="15,95 60,115 105,95 60,75" fill="#581c87" />
        <ellipse cx="60" cy="80" rx="36" ry="16" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
        {/* Columns */}
        <rect x="36" y="50" width="8" height="30" rx="2" fill="#f3e8ff" />
        <rect x="76" y="50" width="8" height="30" rx="2" fill="#f3e8ff" />
        {/* Golden Trophy on pediment */}
        <polygon points="30,50 90,50 60,35" fill="#c084fc" />
        <path d="M52,22 L68,22 L66,32 Q60,38 54,32 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        <circle cx="60" cy="14" r="5" fill="#facc15" />
      </svg>
    );
  }

  // 8. Gemi's Owl Treehouse
  return (
    <svg viewBox="0 0 120 120" className={`w-full h-full drop-shadow-xl ${className}`}>
      {/* Grassy Mound */}
      <ellipse cx="60" cy="98" rx="42" ry="14" fill="#65a30d" />
      {/* Sturdy Oak Trunk */}
      <path d="M50,95 Q52,65 46,45 L74,45 Q68,65 70,95 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
      {/* Foliage Canopy */}
      <circle cx="45" cy="40" r="22" fill="#15803d" />
      <circle cx="75" cy="40" r="22" fill="#15803d" />
      <circle cx="60" cy="28" r="24" fill="#16a34a" />
      {/* Wooden Treehouse Cabin */}
      <rect x="44" y="38" width="32" height="24" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
      {/* Pitched Roof */}
      <polygon points="40,38 80,38 60,20" fill="#92400e" />
      {/* Warm Yellow Window */}
      <rect x="52" y="44" width="16" height="12" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
      {/* Observatory Telescope pointing to sky */}
      <line x1="72" y1="46" x2="88" y2="34" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

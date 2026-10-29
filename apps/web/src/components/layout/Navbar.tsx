import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../services/sound';
import { NpcAvatar } from '../art/NpcAvatar';
import { motion } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  HelpCircle,
  Flame,
  Award,
  Zap,
  Shield,
  Coins,
  MapPin,
  FileText,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const {
    cityState,
    scores,
    isMuted,
    toggleMute,
    setGemiOpen,
    setChaosModalOpen,
    setHowToPlayOpen,
  } = useGameStore();

  const handleSoundToggle = () => {
    soundManager.playClick();
    toggleMute();
  };

  const handleGemiClick = () => {
    soundManager.playClick();
    setGemiOpen(true);
  };

  const handleChaosClick = () => {
    soundManager.playClick();
    setChaosModalOpen(true);
  };

  const handleHelpClick = () => {
    soundManager.playClick();
    setHowToPlayOpen(true);
  };

  const susIndex = scores ? Math.round(scores.sustainabilityIndex) : 65;
  const resilience = scores ? Math.round(scores.resilienceScore) : 80;
  const budget = cityState ? cityState.budget : 100;
  const month = cityState ? cityState.month : 1;
  const xp = cityState ? cityState.xp : 0;
  const totalStars = cityState
    ? Object.values(cityState.stars).reduce((sum, s) => sum + s, 0)
    : 3;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b-3 border-slate-800 text-white shadow-xl px-3 sm:px-5 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand & City info */}
        <div className="flex items-center gap-3">
          <Link
            to="/map"
            onClick={() => soundManager.playClick()}
            className="flex items-center gap-2.5 group hover:opacity-95 transition-all"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-11 h-11 rounded-2xl bg-emerald-500 border-2 border-emerald-300 flex items-center justify-center font-black text-2xl shadow-cartoon-sm"
            >
              🏙️
            </motion.div>
            <div>
              <div className="font-display font-black text-base sm:text-lg text-emerald-400 leading-tight tracking-wide">
                CityMind Quest
              </div>
              <div className="text-xs text-slate-300 font-bold flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-white font-black">{cityState?.cityName || 'Sample City'}</span>
                {cityState?.isRealData && (
                  <span className="text-[10px] bg-sky-500/30 text-sky-300 px-1.5 py-0.5 rounded-full font-black border border-sky-400/40">
                    REAL DATA
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Overworld Map Quick Link */}
          <Link
            to="/map"
            onClick={() => soundManager.playClick()}
            className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 ${
              location.pathname === '/map'
                ? 'bg-emerald-500/25 text-emerald-300 border-2 border-emerald-400/60 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border-2 border-transparent'
            }`}
          >
            🗺️ <span className="hidden md:inline">City Map</span>
          </Link>
        </div>

        {/* Center: Live Prominent HUD Metrics */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Month Indicator */}
          <div className="bg-slate-800 border-2 border-slate-700 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-sm">
            <span className="text-slate-400 text-xs uppercase font-extrabold">Month</span>
            <span className="text-white font-black text-base sm:text-lg font-display">{month}</span>
          </div>

          {/* Treasury Budget */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`border-2 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-sm ${
              budget < 20
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-amber-500/20 border-amber-400 text-amber-300'
            }`}
            title="Municipal Treasury Budget"
          >
            <span className="text-lg">💰</span>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] uppercase font-bold text-slate-400">Budget</span>
              <span className="font-black text-base sm:text-lg font-display text-white">${budget}</span>
            </div>
          </motion.div>

          {/* Live Sustainability Index with animated glow and large visible numbers */}
          <motion.div
            whileHover={{ scale: 1.06 }}
            className={`border-2 px-4 py-1.5 rounded-2xl flex items-center gap-2.5 shadow-cartoon-sm ${
              susIndex >= 70
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                : susIndex >= 50
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                : 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-[0_0_15px_rgba(248,113,113,0.3)]'
            }`}
            title="Live Sustainability Index (Weighted average of Environment, Happiness, Cost, Reliability)"
          >
            <span className="text-xl">🌱</span>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-extrabold">
                Sustainability
              </span>
              <span className="font-black text-lg sm:text-xl font-display text-white">
                {susIndex}<span className="text-xs font-semibold text-slate-300">/100</span>
              </span>
            </div>
          </motion.div>

          {/* Mini Resilience Gauge */}
          <div
            className="hidden md:flex bg-sky-500/20 border-2 border-sky-400/50 text-sky-300 px-3 py-1.5 rounded-2xl items-center gap-2"
            title="Resilience Score: 100 x (0.4 x lowest/baseline + 0.4 x current/baseline + 0.2 x (1 - months_to_recover/6))"
          >
            <Shield className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] uppercase font-bold text-slate-400">Resilience</span>
              <span className="font-black text-base sm:text-lg font-display text-white">{resilience}</span>
            </div>
          </div>

          {/* Stars & XP */}
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-800 border-2 border-slate-700 px-3 py-1.5 rounded-2xl text-slate-200">
            <span className="text-amber-300 font-black text-sm flex items-center gap-1">
              ⭐ {totalStars}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-purple-300 font-black text-sm flex items-center gap-1">
              <Zap className="w-4 h-4 text-purple-400" /> {xp} XP
            </span>
          </div>
        </div>

        {/* Right: Actions, Audio, AI & Modals */}
        <div className="flex items-center gap-2">
          {/* Green Credits Market Link */}
          <Link
            to="/credits"
            onClick={() => soundManager.playClick()}
            className="hidden sm:flex items-center gap-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border-2 border-emerald-500/50 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-black transition-all"
            title="Green Credits Market"
          >
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>${cityState?.credits || 0} GC</span>
          </Link>

          {/* Badge Hall Link */}
          <Link
            to="/badges"
            onClick={() => soundManager.playClick()}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 border-2 border-transparent hover:border-slate-700 rounded-2xl transition-all"
            title="Badge Hall & Leaderboard"
          >
            <Award className="w-5 h-5 text-amber-400" />
          </Link>

          {/* Mayor Report Link */}
          <Link
            to="/report"
            onClick={() => soundManager.playClick()}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 border-2 border-transparent hover:border-slate-700 rounded-2xl transition-all"
            title="Final Mayor's Report"
          >
            <FileText className="w-5 h-5 text-sky-400" />
          </Link>

          {/* Judge Chaos Crisis Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleChaosClick}
            className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border-2 border-rose-500/60 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all"
            title="Judge Chaos Panel (Hotkey: Ctrl+Shift+J)"
          >
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="hidden xl:inline">Chaos</span>
          </motion.button>

          {/* Sound Toggle */}
          <button
            onClick={handleSoundToggle}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-2xl transition-all"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Tutorial / Help Modal */}
          <button
            onClick={handleHelpClick}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-2xl transition-all"
            title="How to play tutorial"
          >
            <HelpCircle className="w-5 h-5 text-sky-400" />
          </button>

          {/* Floating Owl Gemi Button with Shine Effect */}
          <motion.button
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGemiClick}
            className="shine-effect flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 rounded-2xl font-black text-xs sm:text-sm shadow-cartoon-sm border-b-3 border-purple-800 transition-all"
            title="Ask Gemi the Owl (AI City Advisor)"
          >
            <NpcAvatar id="gemi" size="sm" animate={true} className="w-6 h-6 -my-1" />
            <span>Gemi AI</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};

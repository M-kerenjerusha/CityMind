import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../services/sound';
import { AnimatedStandingMascot } from '../components/art/AnimatedStandingMascot';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
  Settings,
  Scroll,
  HelpCircle,
  X,
  Sparkles,
  Zap,
  Leaf,
  Coins,
  DollarSign,
  CloudSun,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { cityState, isMuted, toggleMute, setHowToPlayOpen, resetGame } = useGameStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'casual' | 'balanced' | 'hardcore'>('balanced');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const budgetDisplay = cityState?.budget != null ? cityState.budget.toLocaleString() : '500,000';
  const creditsDisplay = cityState?.credits != null ? cityState.credits : 0;
  const weatherCity = cityState?.cityName || 'Paris';
  const weatherTemp = 22;

  const handleStartGame = () => {
    soundManager.playClick();
    navigate('/map');
  };

  const handleNewCareer = () => {
    soundManager.playClick();
    navigate('/create');
  };

  const handleContinue = () => {
    soundManager.playClick();
    navigate('/map');
  };

  const handleLeaderboard = () => {
    soundManager.playClick();
    navigate('/badges');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-white select-none flex flex-col justify-between">
      {/* 3D Isometric Eco-City Scene Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out transform scale-100 hover:scale-[1.02]"
        style={{
          backgroundImage: "url('/city_start_bg.jpg')",
          backgroundPosition: 'center 40%',
        }}
      >
        {/* Subtle Atmospheric Sky Vignette and Bottom Gradient for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-sky-900/30 pointer-events-none" />
      </div>

      {/* Floating Animated Cartoon Clouds */}
      <div className="absolute top-6 left-0 w-48 h-20 bg-white/70 rounded-full blur-[1px] animate-cloud-slow pointer-events-none z-10" />
      <div className="absolute top-24 left-0 w-64 h-24 bg-white/60 rounded-full blur-[1px] animate-cloud-fast pointer-events-none z-10" />

      {/* ================= TOP STATUS BAR HUD ================= */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-4 pt-4 sm:pt-6 flex items-center justify-between">
        {/* Top Left: Settings Cog Icon */}
        <motion.button
          whileHover={{ scale: 1.12, rotate: 30 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            soundManager.playClick();
            setIsSettingsOpen(true);
          }}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-700/90 hover:bg-purple-600 text-white border-3 border-purple-950 shadow-cartoon flex items-center justify-center transition-all backdrop-blur-md"
          title="Game Settings"
        >
          <Settings className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
        </motion.button>

        {/* Top Center: Currency & Credits HUD Pill */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 14 }}
          className="flex items-center gap-2 sm:gap-4 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border-3 border-slate-700/80 shadow-cartoon text-sm sm:text-base font-black tracking-wide"
        >
          {/* Budget Cash Display */}
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            </span>
            <span className="text-white text-base sm:text-lg font-black font-display tracking-tight">
              {budgetDisplay}
            </span>
          </div>

          <div className="w-[2px] h-5 bg-slate-700/80" />

          {/* Green Credits Display */}
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-300">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </span>
            <span className="text-white text-base sm:text-lg font-black font-display tracking-tight">
              {creditsDisplay}
            </span>
            <span className="text-xs text-amber-300 font-extrabold hidden sm:inline">GC</span>
          </div>

          {/* Live Open-Meteo Weather Pill (optional badge) */}
          <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-700/80 text-sky-300 text-xs font-bold">
            <CloudSun className="w-4 h-4 text-sky-400" />
            <span>{weatherCity} {weatherTemp}°C</span>
          </div>
        </motion.div>

        {/* Top Right: Scroll / Quests & How-to-Play Icon */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.12, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              soundManager.playClick();
              setHowToPlayOpen(true);
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-pink-600/90 hover:bg-pink-500 text-white border-3 border-pink-950 shadow-cartoon flex items-center justify-center transition-all backdrop-blur-md"
            title="Quests & Guide"
          >
            <Scroll className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          </motion.button>
        </div>
      </header>

      {/* ================= MIDDLE FLOATING NOTIFICATION / AMBIENT BUBBLE ================= */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 pointer-events-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          className="pointer-events-auto bg-white/95 backdrop-blur-md text-slate-900 border-3 border-slate-900 px-5 py-3 rounded-2xl shadow-cartoon flex items-center gap-3 animate-float-gentle max-w-sm sm:max-w-md text-center"
        >
          <span className="text-2xl">🌱</span>
          <p className="text-xs sm:text-sm font-black text-slate-800">
            Welcome, Mayor! Balance energy, waste, and transport while cutting emissions and keeping residents happy!
          </p>
        </motion.div>
      </div>

      {/* ================= BOTTOM GAME BANNER & ANIMATED STANDING MASCOT ================= */}
      <footer className="relative z-30 w-full max-w-5xl mx-auto px-3 sm:px-6 pb-4 sm:pb-6 flex flex-col md:flex-row items-center md:items-end justify-center gap-4 lg:gap-8">
        {/* Animated Standing Non-Playable Character Mascot */}
        <div className="order-2 md:order-1 flex-shrink-0">
          <AnimatedStandingMascot onStartClick={handleStartGame} />
        </div>

        {/* The Blue Game Banner & Start Game Button */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 16, delay: 0.1 }}
          className="order-1 md:order-2 flex-1 w-full max-w-xl bg-gradient-to-b from-[#4876ec] to-[#2f5ac4] border-4 border-[#1e3a8a] rounded-3xl p-5 sm:p-7 shadow-[0_12px_0_rgba(15,23,42,0.85)] flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Subtle interior gleam */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 rounded-t-2xl" />

          {/* Subtitle: "START YOUR OWN" */}
          <span className="text-white/95 font-black text-sm sm:text-lg md:text-xl tracking-widest uppercase font-display drop-shadow">
            START YOUR OWN
          </span>

          {/* Main Title: "- SMART ECO CITY -" */}
          <h1 className="game-banner-title text-4xl sm:text-5xl md:text-6xl font-black mt-1 mb-4 select-none">
            - SMART ECO CITY -
          </h1>

          {/* Giant START GAME Action Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95, y: 3 }}
            onClick={handleStartGame}
            className="btn-start-game shine-effect w-full max-w-md py-4 sm:py-5 mb-3 cursor-pointer"
          >
            <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-slate-950 text-slate-950" />
            <span className="drop-shadow-sm">START GAME</span>
          </motion.button>

          {/* Secondary Quick-Access Row */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full mt-1">
            {cityState && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinue}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl border-b-3 border-sky-700 shadow-cartoon-sm flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4 stroke-[3]" />
                <span>CONTINUE (M{cityState.month})</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewCareer}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl border-b-3 border-amber-600 shadow-cartoon-sm flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-900" />
              <span>NEW CAREER</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLeaderboard}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs sm:text-sm rounded-xl border-b-3 border-indigo-800 shadow-cartoon-sm flex items-center gap-1.5 transition-all"
            >
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span>LEADERBOARD</span>
            </motion.button>
          </div>

          {/* Problem Statement SDG Footer Badge */}
          <div className="mt-3 text-[11px] sm:text-xs font-bold text-blue-200/90 flex items-center gap-1.5">
            <span>🏆 Gamathon PS 2.1</span>
            <span>•</span>
            <span>UN SDGs 11, 13 & 7</span>
          </div>
        </motion.div>
      </footer>

      {/* ================= SETTINGS MODAL ================= */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-white text-slate-900 rounded-3xl border-4 border-slate-900 shadow-cartoon max-w-md w-full p-6 relative"
            >
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsSettingsOpen(false);
                }}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-6 h-6 stroke-[3]" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-purple-600 text-white rounded-2xl border-2 border-purple-900 shadow-cartoon-sm">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black font-display text-slate-900">Game Settings</h2>
                  <p className="text-xs text-slate-500 font-bold">Preferences & Simulation Options</p>
                </div>
              </div>

              {/* Sound Audio Toggle */}
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 mb-4 flex items-center justify-between">
                <div>
                  <div className="font-black text-sm text-slate-800">Sound & Audio Effects</div>
                  <div className="text-xs text-slate-500 font-semibold">Synthesized procedural Web Audio SFX</div>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    toggleMute();
                  }}
                  className={`p-3 rounded-xl border-2 font-black text-sm flex items-center gap-2 transition-all ${
                    isMuted
                      ? 'bg-rose-100 border-rose-400 text-rose-700'
                      : 'bg-emerald-100 border-emerald-400 text-emerald-800'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  <span>{isMuted ? 'MUTED' : 'ACTIVE'}</span>
                </button>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-4">
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
                  Simulation Challenge
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['casual', 'balanced', 'hardcore'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedDifficulty(mode);
                      }}
                      className={`py-2 px-1 text-xs font-black rounded-xl border-2 capitalize transition-all ${
                        selectedDifficulty === mode
                          ? 'bg-emerald-500 text-slate-950 border-emerald-800 shadow-cartoon-sm'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Game Button */}
              <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-slate-200 transition-all"
                  >
                    Reset Current City Save
                  </button>
                ) : (
                  <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
                    <p className="text-xs font-bold text-rose-700 mb-2">Are you sure? All progress will restart.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          resetGame();
                          setShowResetConfirm(false);
                          setIsSettingsOpen(false);
                        }}
                        className="flex-1 py-1.5 bg-rose-600 text-white font-black text-xs rounded-lg"
                      >
                        Confirm Reset
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 py-1.5 bg-slate-200 text-slate-800 font-black text-xs rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-3 bg-slate-900 text-white font-black text-sm rounded-2xl hover:bg-slate-800 transition-all shadow-cartoon-sm mt-1"
                >
                  Close Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

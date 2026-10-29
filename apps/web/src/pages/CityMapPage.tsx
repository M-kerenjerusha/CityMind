import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { api } from '../api/client';
import { soundManager } from '../services/sound';
import { NpcAvatar } from '../components/art/NpcAvatar';
import { CitizenSprite } from '../components/art/CitizenSprite';
import {
  AnimatedWindTurbine,
  AnimatedElectricBus,
  AnimatedEcoDrone,
} from '../components/art/AnimatedVehicles';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Lock,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Award,
  Coins,
  DollarSign,
  Zap,
  Sparkles,
  ArrowRight,
  Gift,
  RotateCcw,
  Flame,
  ShieldCheck,
  Trophy,
  X,
  Check,
  Activity,
  Leaf,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Info,
} from 'lucide-react';
import { ActionId, CityScores, CityState, SimulationResult } from '@citymind/shared';

interface SustainabilityVerdict {
  isSustainable: boolean;
  score: number; // 0 - 100
  title: string;
  reason: string;
  emissionsPass: boolean;
  reliabilityPass: boolean;
  budgetPass: boolean;
  happinessPass: boolean;
  recommendationHint: string;
}

export const CityMapPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cityState,
    scores,
    levels,
    refreshCity,
    refreshLevels,
  } = useGameStore();

  const [activeLevelId, setActiveLevelId] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<ActionId[]>([]);
  const [isTestingSolution, setIsTestingSolution] = useState(false);
  const [testVerdict, setTestVerdict] = useState<SustainabilityVerdict | null>(null);
  const [isImplementing, setIsImplementing] = useState(false);

  // Victory Celebration Modal State
  const [completedRewardData, setCompletedRewardData] = useState<{
    levelId: string;
    levelTitle: string;
    stars: number;
    creditsEarned: number;
    xpEarned: number;
    nextLevelId: string | null;
  } | null>(null);

  // Star Chests State
  const [claimedChests, setClaimedChests] = useState<Record<number, boolean>>({});
  const [chestMessage, setChestMessage] = useState<string | null>(null);

  useEffect(() => {
    refreshCity();
    refreshLevels();
  }, [refreshCity, refreshLevels]);

  // Derived Stats
  const totalStars = levels.reduce((acc, l) => acc + (l.stars || 0), 0);
  const playerXP = cityState?.xp || totalStars * 100;
  const playerLevel = Math.floor(playerXP / 300) + 1;
  const currentLevelXP = playerXP % 300;

  // Active level info
  const activeLevel = levels.find((l) => l.id === activeLevelId);

  const handleOpenLevel = (levelId: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      soundManager.playError();
      return;
    }
    soundManager.playClick();
    setActiveLevelId(levelId);
    setSelectedActions([]);
    setTestVerdict(null);
  };

  const handleToggleAction = (actionId: ActionId) => {
    soundManager.playClick();
    setTestVerdict(null); // Reset verdict when solution changes
    setSelectedActions((prev) => {
      if (prev.includes(actionId)) {
        return prev.filter((a) => a !== actionId);
      }
      if (prev.length >= 2) {
        return [prev[1], actionId]; // Max 2 selected actions
      }
      return [...prev, actionId];
    });
  };

  // Run the in-depth Sustainability Stress-Test
  const handleRunSustainabilityTest = async () => {
    if (!activeLevel || selectedActions.length === 0) return;
    soundManager.playClick();
    setIsTestingSolution(true);
    setTestVerdict(null);

    // Simulate testing delay with audio feedback
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      // Evaluate chosen actions against the level's specific sustainability challenge
      const hasSolar = selectedActions.includes('solar');
      const hasBattery = selectedActions.includes('battery');
      const hasBuses = selectedActions.includes('buses');
      const hasSignals = selectedActions.includes('signals');
      const hasRecycling = selectedActions.includes('recycling');
      const hasRoad = selectedActions.includes('road');
      const hasCongestion = selectedActions.includes('congestion');

      let verdict: SustainabilityVerdict;

      if (activeLevel.id === 'power') {
        // Level 1: Power Grid Stress Test
        if (hasSolar && hasBattery) {
          verdict = {
            isSustainable: true,
            score: 95,
            title: '100% SUSTAINABLE & GRID CERTIFIED! 🌟',
            reason: 'Rooftop Solar combined with Battery Storage handles peak surge effortlessly, cutting load to 45 and eliminating blackout risks!',
            emissionsPass: true,
            reliabilityPass: true,
            budgetPass: true,
            happinessPass: true,
            recommendationHint: 'Perfect balance of renewable generation and grid stabilization!',
          };
        } else if (hasBattery && !hasSolar) {
          verdict = {
            isSustainable: true,
            score: 75,
            title: 'SUSTAINABLE (PASS) ⚡',
            reason: 'Grid Battery Bank prevents blackouts, though emissions reduction is moderate without solar generation.',
            emissionsPass: false,
            reliabilityPass: true,
            budgetPass: true,
            happinessPass: true,
            recommendationHint: 'Adding Solar would unlock 3 full stars on this grid challenge!',
          };
        } else if (hasSolar && !hasBattery) {
          verdict = {
            isSustainable: false,
            score: 45,
            title: 'NOT SUSTAINABLE! ❌ (LOAD INSTABILITY)',
            reason: 'Solar alone generates clean power at noon, but lacks storage! During evening peak load, the grid trips into brownouts!',
            emissionsPass: true,
            reliabilityPass: false,
            budgetPass: true,
            happinessPass: false,
            recommendationHint: 'Combine Rooftop Solar with a Grid Battery Bank to stabilize evening peak load!',
          };
        } else {
          verdict = {
            isSustainable: false,
            score: 30,
            title: 'NOT SUSTAINABLE! ❌ (INSUFFICIENT ACTION)',
            reason: 'Selected measures do not address the power station bottleneck.',
            emissionsPass: false,
            reliabilityPass: false,
            budgetPass: true,
            happinessPass: false,
            recommendationHint: 'Select Rooftop Solar and Battery Storage to solve the crisis.',
          };
        }
      } else if (activeLevel.id === 'transit') {
        // Level 2: Transit Gridlock
        if (hasRoad) {
          verdict = {
            isSustainable: false,
            score: 25,
            title: 'NOT SUSTAINABLE! ❌ (INDUCED DEMAND TRAP)',
            reason: 'Widening roads created temporary relief, but immediately induced 24% more private car trips, causing worse smog and gridlock!',
            emissionsPass: false,
            reliabilityPass: false,
            budgetPass: true,
            happinessPass: false,
            recommendationHint: 'Do NOT build more roads! Electrify public transit with buses and smart signals instead.',
          };
        } else if (hasBuses && (hasSignals || hasCongestion)) {
          verdict = {
            isSustainable: true,
            score: 96,
            title: '100% SUSTAINABLE & ECO-FLOWING! 🚌',
            reason: 'Electric Bus Fleet with Smart Signals/Congestion pricing cleared 65% of downtown bottlenecks while slashing tailpipe smog!',
            emissionsPass: true,
            reliabilityPass: true,
            budgetPass: true,
            happinessPass: true,
            recommendationHint: 'Outstanding transit modernization!',
          };
        } else if (hasBuses) {
          verdict = {
            isSustainable: true,
            score: 78,
            title: 'SUSTAINABLE (PASS) 🚌',
            reason: 'Electric buses provide strong public transit alternatives and cut carbon emissions.',
            emissionsPass: true,
            reliabilityPass: true,
            budgetPass: true,
            happinessPass: true,
            recommendationHint: 'Adding Smart Signals will clear remaining intersections faster!',
          };
        } else {
          verdict = {
            isSustainable: false,
            score: 35,
            title: 'NOT SUSTAINABLE! ❌ (CONGESTION UNRESOLVED)',
            reason: 'Traffic remains jammed and idling engines continue polluting downtown air.',
            emissionsPass: false,
            reliabilityPass: false,
            budgetPass: true,
            happinessPass: false,
            recommendationHint: 'Deploy Electric Buses to shift commuters out of private cars!',
          };
        }
      } else if (activeLevel.id === 'waste') {
        // Level 3: Recycling & Waste
        if (hasRecycling && (hasSolar || hasBuses)) {
          verdict = {
            isSustainable: true,
            score: 94,
            title: '100% CIRCULAR & GREEN! ♻️',
            reason: 'Neighborhood recycling drives divert 60% of landfill waste, and clean energy/transit drives emissions to historic lows!',
            emissionsPass: true,
            reliabilityPass: true,
            budgetPass: true,
            happinessPass: true,
            recommendationHint: 'Zero-waste loops fully achieved!',
          };
        } else if (hasRecycling) {
          verdict = {
            isSustainable: true,
            score: 76,
            title: 'SUSTAINABLE (PASS) ♻️',
            reason: 'Waste diversion cuts methane emissions and cleans local industrial yards.',
            emissionsPass: true,
            reliabilityPass: true,
            budgetPass: true,
            happinessPass: true,
            recommendationHint: 'Pair recycling with clean solar power for maximum municipal score!',
          };
        } else {
          verdict = {
            isSustainable: false,
            score: 40,
            title: 'NOT SUSTAINABLE! ❌ (LANDFILL OVERFLOW)',
            reason: 'Methane and trash buildup remain critical without circular recycling drives.',
            emissionsPass: false,
            reliabilityPass: false,
            budgetPass: true,
            happinessPass: false,
            recommendationHint: 'Implement Circular Recycling Drives to reduce landfill burdens!',
          };
        }
      } else {
        // Level 4 & 5
        verdict = {
          isSustainable: true,
          score: 90,
          title: '100% SUSTAINABLE & RESILIENT! 🏆',
          reason: 'Comprehensive municipal policy satisfies all environmental, equity, and reliability benchmarks!',
          emissionsPass: true,
          reliabilityPass: true,
          budgetPass: true,
          happinessPass: true,
          recommendationHint: 'Ready for full city implementation!',
        };
      }

      setTestVerdict(verdict);
      if (verdict.isSustainable) {
        soundManager.playSuccess();
      } else {
        soundManager.playError();
      }
    } finally {
      setIsTestingSolution(false);
    }
  };

  const handleImplementVerifiedSolution = async () => {
    if (!activeLevel || !testVerdict?.isSustainable) return;
    soundManager.playClick();
    setIsImplementing(true);

    try {
      // Implement the selected actions in the simulation engine
      for (const actionId of selectedActions) {
        await api.implementAction(actionId);
      }

      const earnedStars = testVerdict.score >= 90 ? 3 : 2;
      const creditsReward = activeLevel.order * 35 + 25;
      const xpReward = activeLevel.order * 120;

      await api.completeLevel(activeLevel.id, earnedStars);
      await refreshCity();
      await refreshLevels();

      // Celebration Fanfare
      soundManager.playSuccess();
      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.5 },
      });

      const nextLvl = levels.find((l) => l.order === activeLevel.order + 1);

      setCompletedRewardData({
        levelId: activeLevel.id,
        levelTitle: activeLevel.title,
        stars: earnedStars,
        creditsEarned: creditsReward,
        xpEarned: xpReward,
        nextLevelId: nextLvl ? nextLvl.id : null,
      });

      setActiveLevelId(null);
    } catch (err: any) {
      soundManager.playError();
      alert(`Implementation Error: ${err.message}`);
    } finally {
      setIsImplementing(false);
    }
  };

  const handleClaimChest = (starsReq: number, rewardCredits: number) => {
    if (claimedChests[starsReq]) {
      setChestMessage('Already claimed this star chest!');
      setTimeout(() => setChestMessage(null), 2500);
      return;
    }

    if (totalStars < starsReq) {
      soundManager.playError();
      setChestMessage(`🔒 Need ${starsReq - totalStars} more star(s) to unlock this chest!`);
      setTimeout(() => setChestMessage(null), 3000);
      return;
    }

    soundManager.playSuccess();
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
    setClaimedChests((prev) => ({ ...prev, [starsReq]: true }));
    setChestMessage(`🎉 Chest Unlocked! +${rewardCredits} Green Credits added!`);
    setTimeout(() => setChestMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400 p-3 sm:p-6 relative overflow-x-hidden flex flex-col justify-between select-none">
      {/* Background Animated Vehicles, Drones & Turbines */}
      <AnimatedElectricBus className="top-36" />
      <AnimatedEcoDrone className="top-16 left-12" />
      <div className="absolute top-20 right-8 pointer-events-none opacity-80 hidden md:block">
        <AnimatedWindTurbine size={42} />
      </div>
      <div className="absolute top-28 right-24 pointer-events-none opacity-60 hidden md:block">
        <AnimatedWindTurbine size={32} />
      </div>

      {/* Floating Animated Clouds */}
      <div className="absolute top-4 left-0 w-48 h-20 bg-white/80 rounded-full blur-[1px] animate-cloud-slow pointer-events-none" />
      <div className="absolute top-24 left-0 w-64 h-24 bg-white/70 rounded-full blur-[1px] animate-cloud-fast pointer-events-none" />

      {/* ================= TOP ARCADE HUD ================= */}
      <header className="relative z-20 max-w-5xl mx-auto w-full mb-3">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border-4 border-slate-950 p-4 shadow-cartoon text-white flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Player Mayor Profile */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <NpcAvatar id={cityState?.mayorAvatar || 'mira'} size="sm" animate={false} className="w-12 h-12" />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-slate-900 shadow">
                Lv.{playerLevel}
              </div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black font-display text-white flex items-center gap-2">
                <span>{cityState?.mayorName || 'Mayor'}</span>
                <span className="text-xs bg-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  {cityState?.cityName || 'City'}
                </span>
              </div>
              {/* XP Progress Bar */}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-28 sm:w-36 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (currentLevelXP / 300) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-400">{currentLevelXP}/300 XP</span>
              </div>
            </div>
          </div>

          {/* Currency, Credits & Star Counters */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 bg-amber-500/20 px-3.5 py-1.5 rounded-2xl border-2 border-amber-400/50">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-amber-300 text-sm sm:text-base font-black">
                {totalStars} <span className="text-xs text-amber-400/70">/ 15</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/20 px-3.5 py-1.5 rounded-2xl border-2 border-emerald-400/50">
              <span className="text-emerald-400 font-bold">🌱</span>
              <span className="text-emerald-300 text-sm sm:text-base font-black">
                {cityState?.credits ?? 0} <span className="text-xs text-emerald-400/70">GC</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-sky-500/20 px-3.5 py-1.5 rounded-2xl border-2 border-sky-400/50">
              <DollarSign className="w-4 h-4 text-sky-400" />
              <span className="text-sky-300 text-sm sm:text-base font-black">
                {cityState?.budget?.toLocaleString() ?? '500,000'}
              </span>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                navigate('/');
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-black rounded-xl border-2 border-slate-700 text-slate-200 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Menu</span>
            </button>
          </div>
        </div>

        {/* Floating Chest Notification */}
        <AnimatePresence>
          {chestMessage && (
            <motion.div
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              className="mt-2 text-center bg-amber-400 text-slate-950 font-black text-xs sm:text-sm py-2 px-4 rounded-2xl border-2 border-slate-950 shadow-cartoon"
            >
              {chestMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ================= MAIN INTERACTIVE QUEST CAMPAIGN BOARD ================= */}
      <main className="relative z-10 max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center my-2">
        <div className="bg-emerald-600/90 backdrop-blur-md rounded-3xl border-4 border-slate-950 p-6 sm:p-8 shadow-cartoon-lg relative overflow-hidden">
          {/* Animated Road Curve */}
          <div className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-center">
            <svg viewBox="0 0 800 600" className="w-full h-full">
              <path
                d="M 100 500 Q 250 450 400 480 T 700 380 Q 750 250 500 220 T 150 150 Q 250 50 400 60"
                fill="none"
                stroke="#1e293b"
                strokeWidth="60"
                strokeLinecap="round"
              />
              <path
                d="M 100 500 Q 250 450 400 480 T 700 380 Q 750 250 500 220 T 150 150 Q 250 50 400 60"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="4"
                strokeDasharray="14 12"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Comic Action Stickers Floating along borders */}
          <div className="absolute top-3 left-4 bg-yellow-400 text-slate-950 px-3 py-1 rounded-full font-black text-xs border-2 border-slate-950 shadow-cartoon rotate-[-6deg] hidden sm:block pointer-events-none">
            ⚡ ECO-POWER!
          </div>
          <div className="absolute top-3 right-4 bg-pink-500 text-white px-3 py-1 rounded-full font-black text-xs border-2 border-slate-950 shadow-cartoon rotate-[6deg] hidden sm:block pointer-events-none">
            🌿 NET-ZERO TRAIL!
          </div>

          {/* Campaign Header Title */}
          <div className="relative z-10 text-center mb-6">
            <span className="bg-white/95 text-slate-900 border-2 border-slate-950 px-4 py-1.5 rounded-full font-black text-xs tracking-wider uppercase shadow-cartoon-sm">
              🌟 URBAN DECISION LABORATORY
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display mt-2 drop-shadow-[0_4px_0_rgba(15,23,42,0.9)]">
              Level-by-Level Quest Trail
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-extrabold mt-1">
              Select policies, run the 30-day sustainability stress-test, and verify if your city survives!
            </p>
          </div>

          {/* Roadside Animated Citizens cheering */}
          <div className="relative z-10 flex items-center justify-between px-2 sm:px-6 mb-4 pointer-events-none">
            <div className="flex items-center gap-2">
              <CitizenSprite happiness={85} variant={1} className="w-9 h-11" />
              <div className="bg-white text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-lg border border-slate-900 shadow-sm hidden sm:block">
                "We want Solar! ☀️"
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-lg border border-slate-900 shadow-sm hidden sm:block">
                "Clean buses please! 🚌"
              </div>
              <CitizenSprite happiness={90} variant={2} className="w-9 h-11" />
            </div>
          </div>

          {/* Level Nodes Road List */}
          <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
            {levels.map((lvl, index) => {
              const isUnlocked = lvl.unlocked ?? index === 0;
              const isCompleted = lvl.completed;
              const earnedStars = lvl.stars || 0;

              return (
                <motion.div
                  key={lvl.id}
                  whileHover={isUnlocked ? { scale: 1.02, x: 5 } : {}}
                  whileTap={isUnlocked ? { scale: 0.98 } : {}}
                  onClick={() => handleOpenLevel(lvl.id, isUnlocked)}
                  className={`relative rounded-3xl border-3 border-slate-950 p-4 sm:p-5 shadow-cartoon flex flex-col sm:flex-row items-center justify-between gap-4 transition-all cursor-pointer ${
                    !isUnlocked
                      ? 'bg-slate-800/80 opacity-70 cursor-not-allowed'
                      : isCompleted
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950'
                      : 'bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 shadow-cartoon-lg ring-4 ring-yellow-400/50'
                  }`}
                >
                  {/* Left: Level Number & Animated NPC Avatar */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-3 border-slate-950 shadow-cartoon flex items-center justify-center font-black text-xl sm:text-2xl font-display ${
                          !isUnlocked
                            ? 'bg-slate-700 text-slate-400'
                            : isCompleted
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-white text-blue-900 animate-pulse-subtle'
                        }`}
                      >
                        {isUnlocked ? <span>Lvl {lvl.order}</span> : <Lock className="w-7 h-7 text-slate-400" />}
                      </div>
                      {/* Character Mascot Badge */}
                      <div className="absolute -bottom-2 -right-2">
                        <NpcAvatar id={lvl.npcAvatar} size="sm" animate={true} className="w-8 h-8" />
                      </div>
                    </div>

                    {/* Title & Target */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-black text-lg sm:text-xl text-white drop-shadow-sm">
                          {lvl.title}
                        </h3>
                        {isCompleted && (
                          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-950">
                            CLEARED
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white/90 line-clamp-1 mt-0.5">
                        {lvl.missionGoal}
                      </p>
                      <div className="text-[11px] font-black text-slate-900 bg-white/70 inline-block px-2.5 py-0.5 rounded-md mt-1 border border-slate-900/20">
                        🎯 Challenge: {lvl.targetCriteria}
                      </div>
                    </div>
                  </div>

                  {/* Right: Stars, Reward Preview & Play Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-900/20">
                    {/* Stars */}
                    <div className="flex items-center gap-1 bg-black/25 px-3 py-1.5 rounded-xl border border-white/20">
                      {[1, 2, 3].map((starNum) => (
                        <Star
                          key={starNum}
                          className={`w-5 h-5 ${
                            starNum <= earnedStars
                              ? 'text-yellow-300 fill-yellow-300 filter drop-shadow'
                              : 'text-slate-600 fill-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Action Button */}
                    {isUnlocked ? (
                      <button className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-950 font-black text-sm rounded-2xl border-b-4 border-yellow-600 shadow-cartoon flex items-center gap-1.5 transition-all cursor-pointer">
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>{isCompleted ? 'RE-TEST' : 'PLAY'}</span>
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-slate-700 text-slate-400 font-black text-xs rounded-xl flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>LOCKED</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Star Milestone Chests Row */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-900/30 flex flex-wrap items-center justify-around gap-4">
            <div
              onClick={() => handleClaimChest(3, 50)}
              className={`cursor-pointer p-3 rounded-2xl border-3 border-slate-950 shadow-cartoon flex items-center gap-2.5 transition-all hover:scale-105 ${
                claimedChests[3]
                  ? 'bg-slate-300 opacity-60'
                  : totalStars >= 3
                  ? 'bg-amber-400 animate-pulse-subtle'
                  : 'bg-white/90'
              }`}
            >
              <Gift className="w-6 h-6 text-amber-700" />
              <div className="text-left">
                <div className="text-xs font-black text-slate-900">Bronze Vault (3 ⭐)</div>
                <div className="text-[10px] text-slate-600 font-bold">
                  {claimedChests[3] ? 'Claimed (+50 GC)' : '+50 Green Credits'}
                </div>
              </div>
            </div>

            <div
              onClick={() => handleClaimChest(6, 100)}
              className={`cursor-pointer p-3 rounded-2xl border-3 border-slate-950 shadow-cartoon flex items-center gap-2.5 transition-all hover:scale-105 ${
                claimedChests[6]
                  ? 'bg-slate-300 opacity-60'
                  : totalStars >= 6
                  ? 'bg-amber-400 animate-pulse-subtle'
                  : 'bg-white/90'
              }`}
            >
              <Gift className="w-6 h-6 text-sky-700" />
              <div className="text-left">
                <div className="text-xs font-black text-slate-900">Silver Vault (6 ⭐)</div>
                <div className="text-[10px] text-slate-600 font-bold">
                  {claimedChests[6] ? 'Claimed (+100 GC)' : '+100 Green Credits'}
                </div>
              </div>
            </div>

            <div
              onClick={() => handleClaimChest(12, 200)}
              className={`cursor-pointer p-3 rounded-2xl border-3 border-slate-950 shadow-cartoon flex items-center gap-2.5 transition-all hover:scale-105 ${
                claimedChests[12]
                  ? 'bg-slate-300 opacity-60'
                  : totalStars >= 12
                  ? 'bg-amber-400 animate-pulse-subtle'
                  : 'bg-white/90'
              }`}
            >
              <Trophy className="w-6 h-6 text-amber-900" />
              <div className="text-left">
                <div className="text-xs font-black text-slate-900">Mayor Trophy (12 ⭐)</div>
                <div className="text-[10px] text-slate-600 font-bold">
                  {claimedChests[12] ? 'Claimed (+200 GC)' : '+200 GC & Trophy'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= INTERACTIVE SUSTAINABILITY TESTING ARENA ================= */}
      <AnimatePresence>
        {activeLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 25 }}
              className="bg-white text-slate-900 rounded-3xl border-4 border-slate-950 shadow-[0_16px_0_rgba(15,23,42,0.95)] max-w-2xl w-full p-5 sm:p-7 relative max-h-[92vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveLevelId(null)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-6 h-6 stroke-[3]" />
              </button>

              {/* Header with Mascot & Title */}
              <div className="flex items-center gap-4 mb-3">
                <NpcAvatar id={activeLevel.npcAvatar} size="lg" className="w-16 h-16 sm:w-20 sm:h-20" />
                <div>
                  <div className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                    <span>Level {activeLevel.order}</span>
                    <span>&bull;</span>
                    <span>{activeLevel.npcName} ({activeLevel.npcRole})</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 leading-tight">
                    {activeLevel.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-bold">
                    {activeLevel.subtitle}
                  </p>
                </div>
              </div>

              {/* Character Speech Dialogue Bubble */}
              <div className="bg-sky-50 border-3 border-sky-300 rounded-2xl p-4 mb-4 text-xs sm:text-sm font-bold text-slate-800 leading-relaxed shadow-sm">
                "{activeLevel.initialDialogue || activeLevel.missionGoal}"
              </div>

              {/* Goal Box */}
              <div className="bg-amber-100 border-3 border-amber-400 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-black text-amber-900 uppercase">Target Objective</div>
                  <div className="text-sm font-black text-slate-950 mt-0.5">
                    {activeLevel.targetCriteria}
                  </div>
                </div>
                <div className="bg-amber-400 text-slate-950 px-3 py-1 rounded-xl text-xs font-black border border-amber-600 shadow-sm">
                  Reward: +{activeLevel.order * 35 + 25} GC 🏆
                </div>
              </div>

              {/* Interactive Policy Choice Cards */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Choose Policies to Test (Max 2):
                  </label>
                  <span className="text-xs font-bold text-slate-500">
                    Selected: {selectedActions.length}/2
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(activeLevel.allowedActionIds || ['solar', 'battery', 'buses', 'signals', 'road']).map(
                    (actionId) => {
                      const isSelected = selectedActions.includes(actionId as ActionId);
                      const actionInfo =
                        actionId === 'solar'
                          ? { name: 'Rooftop Solar ($10k)', icon: '☀️', desc: '-15 Emissions, clean generation' }
                          : actionId === 'battery'
                          ? { name: 'Grid Battery Bank ($15k)', icon: '🔋', desc: '-18 Peak Load, +15 Reliability' }
                          : actionId === 'buses'
                          ? { name: 'Electric Bus Fleet ($12k)', icon: '🚌', desc: '-14 Traffic, -12 Emissions' }
                          : actionId === 'signals'
                          ? { name: 'Smart Traffic Signals ($8k)', icon: '🚦', desc: '-8 Traffic, smooth flow' }
                          : actionId === 'recycling'
                          ? { name: 'Recycling Drives ($7k)', icon: '♻️', desc: '-16 Waste, circular reuse' }
                          : actionId === 'congestion'
                          ? { name: 'Congestion Pricing ($5k)', icon: '🛑', desc: '-10 Traffic, +Revenue' }
                          : { name: 'Road Widening ($15k)', icon: '🛣️', desc: '+Short term flow, adds car smog' };

                      return (
                        <button
                          key={actionId}
                          onClick={() => handleToggleAction(actionId as ActionId)}
                          className={`p-3 rounded-2xl border-3 text-left transition-all flex items-start justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 border-emerald-950 shadow-cartoon-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-black text-xs sm:text-sm flex items-center gap-1.5">
                              <span>{actionInfo.icon}</span>
                              <span>{actionInfo.name}</span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-600 mt-0.5">
                              {actionInfo.desc}
                            </div>
                          </div>
                          {isSelected ? (
                            <div className="bg-slate-950 text-white rounded-full p-1">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Stress Test Simulation Progress Animation */}
              {isTestingSolution && (
                <div className="bg-slate-900 text-white p-4 rounded-2xl border-2 border-slate-800 my-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
                    <span className="font-display font-black text-sm text-sky-300">
                      Running 30-Day Sustainability Stress Test...
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.1 }}
                      className="h-full bg-gradient-to-r from-sky-400 to-emerald-400"
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 font-bold">
                    Testing Weather Shock &bull; Grid Demand Peak &bull; Life-Cycle Emissions
                  </div>
                </div>
              )}

              {/* SUSTAINABILITY VERDICT REPORT CARD */}
              {testVerdict && !isTestingSolution && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-4 rounded-2xl border-3 my-4 ${
                    testVerdict.isSustainable
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                      : 'bg-rose-50 border-rose-500 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-black font-display text-base sm:text-lg">
                      {testVerdict.isSustainable ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-600 animate-bounce" />
                      )}
                      <span>{testVerdict.title}</span>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-xl text-xs font-black text-white ${
                        testVerdict.isSustainable ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    >
                      Audit Score: {testVerdict.score}/100
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-bold leading-relaxed mb-3">
                    {testVerdict.reason}
                  </p>

                  {/* 4 Pillars Checklist */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-black">
                    <div
                      className={`p-2 rounded-xl border ${
                        testVerdict.emissionsPass
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-rose-100 border-rose-300 text-rose-800'
                      }`}
                    >
                      <div>🌿 Carbon</div>
                      <div>{testVerdict.emissionsPass ? 'PASSED' : 'FAILED'}</div>
                    </div>

                    <div
                      className={`p-2 rounded-xl border ${
                        testVerdict.reliabilityPass
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-rose-100 border-rose-300 text-rose-800'
                      }`}
                    >
                      <div>⚡ Reliability</div>
                      <div>{testVerdict.reliabilityPass ? 'PASSED' : 'FAILED'}</div>
                    </div>

                    <div
                      className={`p-2 rounded-xl border ${
                        testVerdict.budgetPass
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-rose-100 border-rose-300 text-rose-800'
                      }`}
                    >
                      <div>💰 Budget</div>
                      <div>{testVerdict.budgetPass ? 'PASSED' : 'FAILED'}</div>
                    </div>

                    <div
                      className={`p-2 rounded-xl border ${
                        testVerdict.happinessPass
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-rose-100 border-rose-300 text-rose-800'
                      }`}
                    >
                      <div>😊 Citizens</div>
                      <div>{testVerdict.happinessPass ? 'PASSED' : 'FAILED'}</div>
                    </div>
                  </div>

                  {/* Recommendation Hint */}
                  <div className="mt-3 text-[11px] font-black text-slate-700 bg-white/70 p-2 rounded-xl border border-slate-300 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <span>Advisor Hint: {testVerdict.recommendationHint}</span>
                  </div>
                </motion.div>
              )}

              {/* Bottom Testing & Implementation Controls */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  disabled={selectedActions.length === 0 || isTestingSolution}
                  onClick={handleRunSustainabilityTest}
                  className="flex-1 py-3.5 bg-sky-500 hover:bg-sky-400 active:scale-95 disabled:opacity-50 text-slate-950 font-black text-sm rounded-2xl border-b-4 border-sky-800 shadow-cartoon flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Activity className="w-5 h-5" />
                  <span>🧪 TEST SUSTAINABILITY (STRESS TEST)</span>
                </button>

                {testVerdict?.isSustainable ? (
                  <button
                    disabled={isImplementing}
                    onClick={handleImplementVerifiedSolution}
                    className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 active:scale-95 disabled:opacity-50 text-slate-950 font-black text-sm sm:text-base rounded-2xl border-b-4 border-emerald-800 shadow-cartoon flex items-center justify-center gap-2 transition-all cursor-pointer shine-effect animate-bounce"
                  >
                    <Sparkles className="w-5 h-5 text-slate-950 fill-yellow-300" />
                    <span>{isImplementing ? 'Certifying...' : '🚀 IMPLEMENT & CLAIM REWARDS!'}</span>
                  </button>
                ) : (
                  <div className="flex-1 py-3.5 bg-slate-200 text-slate-500 font-black text-xs rounded-2xl flex items-center justify-center gap-2 border-2 border-slate-300 text-center">
                    <span>Pass stress test to unlock rewards</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= REWARD CELEBRATION MODAL ================= */}
      <AnimatePresence>
        {completedRewardData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 30 }}
              className="bg-white text-slate-900 rounded-3xl border-4 border-amber-400 shadow-[0_16px_0_rgba(15,23,42,0.9)] max-w-md w-full p-6 sm:p-8 text-center relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-amber-400 rounded-full border-4 border-slate-950 shadow-cartoon mx-auto flex items-center justify-center mb-4 text-4xl animate-bounce">
                🏆
              </div>

              <h2 className="text-3xl sm:text-4xl font-black font-display text-slate-900 uppercase tracking-tight">
                LEVEL CLEARED!
              </h2>
              <p className="text-sm font-bold text-slate-600 mt-1">
                {completedRewardData.levelTitle}
              </p>

              {/* Stars */}
              <div className="flex items-center justify-center gap-3 my-5">
                {[1, 2, 3].map((starNum) => (
                  <motion.div
                    key={starNum}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2 + starNum * 0.15, type: 'spring', damping: 10 }}
                  >
                    <Star className="w-10 h-10 text-amber-400 fill-amber-400 filter drop-shadow-md" />
                  </motion.div>
                ))}
              </div>

              {/* Rewards Claimed */}
              <div className="bg-emerald-50 border-3 border-emerald-400 rounded-2xl p-4 mb-6 text-slate-900">
                <div className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-2">
                  Rewards Deposited:
                </div>
                <div className="flex items-center justify-around">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl">🌱</span>
                    <span className="text-xl font-black text-emerald-700">
                      +{completedRewardData.creditsEarned} GC
                    </span>
                  </div>
                  <div className="w-[2px] h-8 bg-emerald-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl">⚡</span>
                    <span className="text-xl font-black text-sky-700">
                      +{completedRewardData.xpEarned} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex flex-col gap-2.5">
                {completedRewardData.nextLevelId ? (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      const nextId = completedRewardData.nextLevelId;
                      setCompletedRewardData(null);
                      if (nextId) handleOpenLevel(nextId, true);
                    }}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-lg rounded-2xl border-b-4 border-emerald-800 shadow-cartoon flex items-center justify-center gap-2 transition-all cursor-pointer shine-effect"
                  >
                    <span>NEXT LEVEL</span>
                    <ArrowRight className="w-5 h-5 stroke-[3]" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setCompletedRewardData(null);
                    }}
                    className="w-full py-4 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-lg rounded-2xl border-b-4 border-amber-700 shadow-cartoon transition-all cursor-pointer"
                  >
                    ALL CAMPAIGN LEVELS CLEARED! 🏆
                  </button>
                )}

                <button
                  onClick={() => {
                    soundManager.playClick();
                    setCompletedRewardData(null);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Return to Campaign Map
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

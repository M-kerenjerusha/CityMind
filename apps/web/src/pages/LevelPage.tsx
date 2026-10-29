import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { api } from '../api/client';
import { soundManager } from '../services/sound';
import { NpcAvatar } from '../components/art/NpcAvatar';
import { TypewriterText } from '../components/ui/TypewriterText';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ActionDefinition,
  ActionId,
  CityScores,
  CityState,
  DoctorRecoveryPlan,
  PrioritySliders,
  SimulationResult,
} from '@citymind/shared';
import {
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle,
  AlertTriangle,
  Flame,
  Star,
  Award,
  ShieldCheck,
  Sliders,
  Zap,
} from 'lucide-react';

export const LevelPage: React.FC = () => {
  const { levelId = 'power' } = useParams<{ levelId: string }>();
  const navigate = useNavigate();

  const {
    cityState,
    scores,
    levels,
    refreshCity,
    refreshLevels,
    setChaosModalOpen,
  } = useGameStore();

  const [selectedActionId, setSelectedActionId] = useState<ActionId | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isImplementing, setIsImplementing] = useState(false);
  const [implementationResult, setImplementationResult] = useState<SimulationResult | null>(null);
  const [npcDebrief, setNpcDebrief] = useState<string | null>(null);
  const [isDebriefLoading, setIsDebriefLoading] = useState(false);

  // Doctor's recovery plan (for crisis level)
  const [doctorPlan, setDoctorPlan] = useState<DoctorRecoveryPlan | null>(null);

  // Priority Sliders state (for City Hall level or custom tuning)
  const [sliders, setSliders] = useState<PrioritySliders>(
    cityState?.priorities || { environment: 40, happiness: 30, cost: 20, reliability: 10 }
  );

  const levelInfo = levels.find((l) => l.id === levelId);

  useEffect(() => {
    refreshCity();
    refreshLevels();
    setPreviewData(null);
    setImplementationResult(null);
    setNpcDebrief(null);

    if (levelId === 'crisis') {
      api.getDoctorPlan().then((plan) => setDoctorPlan(plan)).catch(() => {});
    }
  }, [levelId]);

  if (!levelInfo) {
    return (
      <div className="p-8 text-center text-white">
        <h2 className="text-3xl font-black font-display text-rose-400">Level Not Found</h2>
        <button onClick={() => navigate('/map')} className="mt-4 btn-cartoon-green">
          Back to City Map
        </button>
      </div>
    );
  }

  // Filter allowed actions for this level
  const allowedActions = levelInfo.allowedActionIds || ['solar', 'battery'];

  const handleSelectAction = (actionId: ActionId) => {
    soundManager.playClick();
    setSelectedActionId(actionId);
    setPreviewData(null);
  };

  const handleSimulate = async () => {
    if (!selectedActionId) return;
    soundManager.playClick();
    setIsPreviewLoading(true);

    try {
      const data = await api.previewAction(selectedActionId);
      setPreviewData(data);
    } catch (err: any) {
      soundManager.playError();
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleImplement = async () => {
    if (!selectedActionId) return;
    soundManager.playClick();
    setIsImplementing(true);

    try {
      const result = await api.implementAction(selectedActionId);
      setImplementationResult(result);
      soundManager.playSuccess();

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      // Complete Level in DB & unlock next
      const earnedStars = 3;
      await api.completeLevel(levelId, earnedStars);
      await refreshCity();
      await refreshLevels();

      // Ask Gemini for NPC debrief
      setIsDebriefLoading(true);
      try {
        const debriefRes = await api.aiExplain(levelInfo.npcAvatar, levelId, selectedActionId);
        setNpcDebrief(debriefRes.reply);
      } catch {
        setNpcDebrief(levelInfo.targetCriteria);
      } finally {
        setIsDebriefLoading(false);
      }
    } catch (err: any) {
      soundManager.playError();
      alert(`Implementation Error: ${err.message}`);
    } finally {
      setIsImplementing(false);
    }
  };

  const handleSliderChange = async (key: keyof PrioritySliders, val: number) => {
    const updated = { ...sliders, [key]: val };
    setSliders(updated);
    try {
      await api.updatePriorities(updated);
      await refreshCity();
    } catch (e) {
      console.warn('Failed to update priorities:', e);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-900 text-white p-4 sm:p-7 max-w-6xl mx-auto space-y-6 select-none">
      {/* Level Header Banner with Big Bold Typography */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-800/95 border-3 border-slate-700 rounded-3xl p-5 sm:p-6 shadow-cartoon flex flex-col sm:flex-row items-center justify-between gap-5"
      >
        <div className="flex items-center gap-5">
          <motion.div whileHover={{ scale: 1.15, rotate: 5 }}>
            <NpcAvatar id={levelInfo.npcAvatar} size="xl" animate={true} />
          </motion.div>
          <div>
            <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 inline-block mb-1">
              Mission Stage {levelInfo.order}: {levelInfo.subtitle}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white leading-tight tracking-tight">
              {levelInfo.title}
            </h1>
            <div className="text-sm sm:text-base text-slate-200 font-extrabold mt-2 flex items-center gap-2">
              <span className="text-amber-400 text-lg">🎯</span>
              <span>Mission Goal:</span>
              <strong className="text-amber-300 bg-slate-900/80 px-3 py-1 rounded-xl border border-slate-700">
                {levelInfo.missionGoal}
              </strong>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/map')}
          className="btn-cartoon-slate text-sm sm:text-base shrink-0"
        >
          🗺️ Return to Map
        </button>
      </motion.div>

      {/* NPC Dialogue Box with Typewriter Effect and High-Contrast Large Text */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="speech-bubble bg-white border-3 border-slate-950 p-6 rounded-3xl text-slate-900 shadow-cartoon relative"
      >
        <div className="text-xs sm:text-sm font-black text-sky-800 uppercase tracking-wider mb-1.5 flex items-center gap-2">
          <span>🗣️</span>
          <span>{levelInfo.npcName} ({levelInfo.npcRole}) Briefing:</span>
        </div>
        <TypewriterText
          text={implementationResult ? (npcDebrief || 'Analyzing performance data...') : (levelInfo as any).initialDialogue || levelInfo.missionGoal}
          speedMs={18}
          className="text-base sm:text-lg md:text-xl font-extrabold leading-relaxed text-slate-900"
        />
      </motion.div>

      {/* If City Hall Level: Priority Sliders Tuning Box */}
      {levelId === 'hall' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/95 border-3 border-amber-500/50 rounded-3xl p-6 shadow-cartoon space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-400 flex items-center gap-2.5">
              <Sliders className="w-5 h-5" /> Municipal Council Priority Sliders
            </h2>
            <span className="text-xs sm:text-sm text-slate-300 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
              Live Re-weighting
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 text-sm font-black">
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700">
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300">Environment</span>
                <span className="text-emerald-400 text-base">{sliders.environment}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliders.environment}
                onChange={(e) => handleSliderChange('environment', Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2.5"
              />
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700">
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300">Happiness</span>
                <span className="text-sky-400 text-base">{sliders.happiness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliders.happiness}
                onChange={(e) => handleSliderChange('happiness', Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer h-2.5"
              />
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700">
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300">Cost / Budget</span>
                <span className="text-amber-400 text-base">{sliders.cost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliders.cost}
                onChange={(e) => handleSliderChange('cost', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2.5"
              />
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700">
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300">Grid Reliability</span>
                <span className="text-purple-400 text-base">{sliders.reliability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliders.reliability}
                onChange={(e) => handleSliderChange('reliability', Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer h-2.5"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* If Crisis Level: Emergency Response & Doctor's 3-Step Plan */}
      {levelId === 'crisis' && doctorPlan && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-950/70 border-3 border-rose-600 rounded-3xl p-6 shadow-cartoon space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black uppercase text-rose-300 flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-rose-400 animate-pulse" /> Doctor's 3-Step Emergency Recovery Protocol
            </h2>
            <button
              onClick={() => setChaosModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md"
            >
              Trigger Surprise Crisis 🚨
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {doctorPlan.steps.map((st) => (
              <motion.div
                whileHover={{ scale: 1.04 }}
                key={st.stepNumber}
                className="bg-slate-900/90 p-4 rounded-2xl border-2 border-rose-800 text-xs sm:text-sm space-y-1.5"
              >
                <div className="font-black text-amber-300 text-sm sm:text-base flex items-center gap-1.5">
                  <span>Step {st.stepNumber}:</span>
                  <span>{st.action.name}</span>
                </div>
                <div className="text-slate-200 font-semibold leading-snug">{st.rationale}</div>
                <div className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg font-mono font-bold inline-block border border-emerald-500/40">
                  {st.acceleratedRecoveryBonus}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Interactive Policy Decision Cards Grid with Big Labels */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <span>📋</span>
            <span>Available Policies & Municipal Reforms</span>
          </h2>
          <span className="text-xs sm:text-sm text-slate-300 font-bold bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Max 2 buys per policy (2nd buy = 50% effects)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {[
            { id: 'buses', name: 'Increase Buses', cost: 15, tag: 'Transit', desc: 'Downtown & Residential: Traffic -12, Emissions -8; Happiness +5', icon: '🚌' },
            { id: 'signals', name: 'Smart Traffic Signals', cost: 8, tag: 'Transit', desc: 'Downtown: Traffic -8, Emissions -4', icon: '🚦' },
            { id: 'road', name: 'Build New Road', cost: 25, tag: 'Infrastructure', desc: 'Downtown Traffic -15, Emissions +6, Happiness -3', icon: '🛣️' },
            { id: 'solar', name: 'Rooftop Solar', cost: 20, tag: 'Energy', desc: 'All Zones: Energy Load -12, Emissions -10', icon: '☀️' },
            { id: 'battery', name: 'Battery Storage', cost: 18, tag: 'Energy', desc: 'All Zones: Energy Load -8; Reduces Heatwave Damage by 40%', icon: '🔋' },
            { id: 'recycling', name: 'Waste Recycling Drive', cost: 10, tag: 'Waste', desc: 'Industrial & Residential: Emissions -6, Happiness +4', icon: '♻️' },
            { id: 'congestion', name: 'Congestion Pricing', cost: 5, tag: 'Policy', desc: 'Downtown Traffic -10, Residential Happiness -8 (Trade-off)', icon: '🏷️' },
          ]
            .filter((a) => allowedActions.includes(a.id as any))
            .map((action) => {
              const timesPurchased = cityState?.actionsTaken[action.id as ActionId] || 0;
              const isSelected = selectedActionId === action.id;
              const isAffordable = (cityState?.budget || 0) >= action.cost;
              const isMaxed = timesPurchased >= 2;

              return (
                <motion.div
                  key={action.id}
                  whileHover={!isMaxed ? { scale: 1.04, y: -4 } : {}}
                  whileTap={!isMaxed ? { scale: 0.97 } : {}}
                  onClick={() => !isMaxed && handleSelectAction(action.id as any)}
                  className={`p-5 rounded-3xl border-3 transition-all relative flex flex-col justify-between ${
                    isMaxed
                      ? 'bg-slate-900/60 border-slate-800 opacity-50 cursor-not-allowed'
                      : isSelected
                      ? 'bg-emerald-950/85 border-emerald-400 shadow-cartoon scale-[1.02] cursor-pointer'
                      : 'bg-slate-800/90 border-slate-700 hover:border-slate-500 shadow-cartoon-sm cursor-pointer'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl sm:text-4xl">{action.icon}</span>
                      <span className="text-xs sm:text-sm bg-slate-950 text-amber-300 font-mono font-black px-3 py-1 rounded-full border border-amber-400/50 shadow-sm">
                        Cost: ${action.cost}
                      </span>
                    </div>

                    <h3 className="font-display font-black text-lg sm:text-xl text-white mt-1">
                      {action.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 font-bold mt-2 leading-snug">
                      {action.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-xs sm:text-sm font-extrabold">
                    <span className="text-slate-300">
                      Purchased: <strong className="text-white text-sm">{timesPurchased}/2</strong>
                    </span>
                    {!isAffordable && !isMaxed && (
                      <span className="text-rose-400 font-black">Low Treasury</span>
                    )}
                    {isMaxed && <span className="text-slate-500 font-black">Limit Reached</span>}
                    {timesPurchased === 1 && (
                      <span className="text-amber-400 font-black">2nd Buy (-50%)</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* SIMULATE & IMPLEMENT Decision Action Bar with Big Bold Buttons */}
      <motion.div
        layout
        className="bg-slate-800/95 border-3 border-slate-700 rounded-3xl p-6 shadow-cartoon flex flex-col sm:flex-row items-center justify-between gap-5"
      >
        <div>
          <div className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-wider">
            Selected Municipal Policy
          </div>
          <div className="text-xl sm:text-2xl font-black font-display text-white mt-0.5">
            {selectedActionId ? selectedActionId.toUpperCase() : 'None Selected (Pick a card above)'}
          </div>
          <div className="text-xs sm:text-sm text-slate-300 font-extrabold mt-1">
            Available Treasury: <strong className="text-amber-300 text-base">${cityState?.budget}</strong>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* SIMULATE (Preview without spending) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSimulate}
            disabled={!selectedActionId || isPreviewLoading}
            className="flex-1 sm:flex-none btn-cartoon-blue shine-effect"
            title="Preview simulation consequences without modifying stored budget or month"
          >
            <Eye className="w-5 h-5" />
            <span>{isPreviewLoading ? 'Simulating...' : 'SIMULATE PREVIEW'}</span>
          </motion.button>

          {/* IMPLEMENT (Commit decision) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleImplement}
            disabled={!selectedActionId || isImplementing}
            className="flex-1 sm:flex-none btn-cartoon-green shine-effect"
            title="Implement policy into city law, spend budget, and advance month"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isImplementing ? 'Enacting...' : 'IMPLEMENT POLICY'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Before / After Preview Animated Panel */}
      <AnimatePresence>
        {previewData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-sky-950/80 border-3 border-sky-400 rounded-3xl p-6 shadow-cartoon space-y-4"
          >
            <div className="flex items-center gap-2.5 text-sky-200 font-display font-black text-lg sm:text-xl">
              <Sparkles className="w-6 h-6 text-sky-400 animate-spin" />
              <span>Pure Simulation Preview (Zero Treasury Spent)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-slate-700">
                <span className="text-xs sm:text-sm text-slate-400 font-extrabold uppercase">Sustainability Index</span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-display">
                  {previewData.previousScores.sustainabilityIndex} ➔{' '}
                  <span className={previewData.delta.sustainabilityIndex >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {previewData.previewScores.sustainabilityIndex}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-slate-700">
                <span className="text-xs sm:text-sm text-slate-400 font-extrabold uppercase">Emissions Score</span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-display">
                  {previewData.previousScores.emissionsScore} ➔{' '}
                  <span className="text-emerald-400">{previewData.previewScores.emissionsScore}</span>
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-slate-700">
                <span className="text-xs sm:text-sm text-slate-400 font-extrabold uppercase">Citizen Happiness</span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-display">
                  {previewData.previousScores.happinessScore} ➔{' '}
                  <span className="text-sky-400">{previewData.previewScores.happinessScore}</span>
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-slate-700">
                <span className="text-xs sm:text-sm text-slate-400 font-extrabold uppercase">Treasury After Action</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1.5 font-display">
                  ${previewData.previewState.budget}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Implementation Results Screen with Big Celebration & Contributors */}
      <AnimatePresence>
        {implementationResult && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-emerald-950/85 border-4 border-emerald-400 rounded-3xl p-6 sm:p-8 shadow-cartoon-lg space-y-5"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl animate-bounce">🎉</div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-display font-black text-emerald-300">
                    Policy Enacted Successfully!
                  </h3>
                  <p className="text-sm sm:text-base text-emerald-100 font-bold mt-1">
                    Earned <strong className="text-amber-300">+{implementationResult.creditsEarned} Green Credits</strong> and <strong className="text-purple-300">+50 Mayor XP</strong>!
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/map')}
                className="btn-cartoon-green text-base sm:text-lg shrink-0"
              >
                Continue to Overworld Map ➔
              </motion.button>
            </div>

            {/* Top 3 Score Contributors Explanation */}
            <div className="bg-slate-900/90 p-5 rounded-3xl border-2 border-slate-700 space-y-3">
              <div className="font-black text-sm sm:text-base text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>🔍</span>
                <span>Why Did My Score Change? (Top 3 Contributors)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {implementationResult.topContributors.map((c, i) => (
                  <div key={i} className="bg-slate-800 p-3.5 rounded-2xl border border-slate-700">
                    <div className="font-black text-base text-white flex justify-between">
                      <span>{c.factor}</span>
                      <span className={c.isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                        {c.delta > 0 ? `+${c.delta}` : c.delta}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300 font-semibold mt-1.5 leading-snug">
                      {c.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

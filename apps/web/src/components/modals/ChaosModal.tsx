import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { api } from '../../api/client';
import { soundManager } from '../../services/sound';
import { NpcAvatar } from '../art/NpcAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, AlertTriangle, ShieldAlert, X, Zap } from 'lucide-react';

export const ChaosModal: React.FC = () => {
  const {
    isChaosModalOpen,
    setChaosModalOpen,
    refreshCity,
    setActiveCrisisNotice,
  } = useGameStore();

  const [selectedCrisis, setSelectedCrisis] = useState<'heatwave' | 'factory_closing' | 'transport_strike'>('heatwave');
  const [severity, setSeverity] = useState<'mild' | 'severe' | 'catastrophic'>('severe');
  const [isExecuting, setIsExecuting] = useState(false);
  const [crisisResult, setCrisisResult] = useState<any | null>(null);

  // Global hotkey: Ctrl + Shift + J for judges
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        soundManager.playClick();
        setChaosModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setChaosModalOpen]);

  if (!isChaosModalOpen) return null;

  const handleTriggerCrisis = async () => {
    setIsExecuting(true);
    soundManager.playSiren();

    try {
      const res = await api.triggerCrisis(selectedCrisis, severity);
      setCrisisResult(res);
      setActiveCrisisNotice(res);
      await refreshCity();
    } catch (err: any) {
      alert(`Error triggering crisis: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClose = () => {
    soundManager.playClick();
    setCrisisResult(null);
    setChaosModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-slate-900 border-4 border-rose-600 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white"
      >
        {/* Flashing danger header border */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-rose-600 via-amber-400 to-rose-600 animate-pulse" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2.5 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header with Large Text */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border-3 border-rose-500 flex items-center justify-center text-rose-500">
            <Flame className="w-8 h-8 animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-rose-400 flex items-center gap-3">
              <span>Judge Chaos Panel</span>
              <span className="text-xs bg-rose-950 border-2 border-rose-800 text-rose-300 px-3 py-1 rounded-xl font-mono font-bold">
                Ctrl+Shift+J
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-bold mt-1">
              Inject surprise shocks to test how earlier choices protect the city!
            </p>
          </div>
        </div>

        {!crisisResult ? (
          <div className="space-y-6">
            {/* Crisis Selection */}
            <div>
              <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300 block mb-2.5">
                Select Crisis Scenario
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'heatwave',
                    name: 'Extreme Heatwave',
                    icon: '🔥',
                    desc: 'Load +25, Happiness -12. Battery mitigates -40%, Solar -15%.',
                  },
                  {
                    id: 'factory_closing',
                    name: 'Factory Closure',
                    icon: '🏭',
                    desc: 'Industrial emissions -20, Happiness -15, Budget -$8.',
                  },
                  {
                    id: 'transport_strike',
                    name: 'Transit Strike',
                    icon: '⚠️',
                    desc: 'Traffic +25, Happiness -10. Buses mitigate -30%.',
                  },
                ].map((c) => (
                  <motion.button
                    key={c.id}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedCrisis(c.id as any);
                    }}
                    className={`p-4 rounded-3xl border-3 text-left transition-all ${
                      selectedCrisis === c.id
                        ? 'bg-rose-950/80 border-rose-500 text-white shadow-lg'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-3xl mb-1.5">{c.icon}</div>
                    <div className="font-black text-base text-white">{c.name}</div>
                    <div className="text-xs text-slate-300 font-bold mt-1.5 leading-snug">{c.desc}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Severity Multiplier */}
            <div>
              <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300 block mb-2.5">
                Severity Multiplier
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'mild', label: 'Mild (0.5x)', color: 'text-amber-300 border-amber-500' },
                  { id: 'severe', label: 'Severe (1.0x)', color: 'text-rose-400 border-rose-500' },
                  { id: 'catastrophic', label: 'Catastrophic (1.5x)', color: 'text-purple-300 border-purple-500' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSeverity(s.id as any);
                    }}
                    className={`py-3 px-4 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all ${
                      severity === s.id
                        ? `bg-slate-800 border-white text-white shadow-md scale-105`
                        : `bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800`
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleTriggerCrisis}
              disabled={isExecuting}
              className="shine-effect w-full py-4 bg-rose-600 hover:bg-rose-500 active:translate-y-1 text-white font-black text-lg sm:text-xl rounded-2xl border-b-4 border-rose-800 shadow-cartoon flex items-center justify-center gap-3 transition-all disabled:opacity-50 tracking-wide"
            >
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <span>UNLEASH CRISIS ON CITY</span>
            </motion.button>
          </div>
        ) : (
          /* Crisis Impact Result Screen */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-5"
          >
            <div className="p-5 bg-rose-950/80 border-3 border-rose-600 rounded-3xl text-center space-y-1">
              <div className="text-4xl mb-1 animate-bounce">🚨</div>
              <h3 className="font-display font-black text-2xl text-rose-300">
                {crisisResult.crisis.name} Struck the City!
              </h3>
              <p className="text-sm text-rose-100 font-bold max-w-lg mx-auto">{crisisResult.crisis.description}</p>
            </div>

            {/* Mitigation Shield Notice */}
            <div className="p-4 bg-slate-800 rounded-3xl border-2 border-sky-400 flex items-start gap-4 shadow-sm">
              <ShieldAlert className="w-8 h-8 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs sm:text-sm font-black text-sky-300 uppercase tracking-wider">
                  Resilience Mitigation Audit
                </div>
                <div className="text-base sm:text-lg text-white font-black mt-0.5">
                  {crisisResult.mitigationMessage}
                </div>
              </div>
            </div>

            {/* NPC Chief Blaze Response */}
            <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-3xl border-2 border-slate-800">
              <NpcAvatar id="blaze" size="md" animate={true} />
              <div className="text-xs sm:text-sm text-slate-200 font-bold leading-relaxed">
                <strong className="text-rose-400 text-sm sm:text-base">Chief Blaze:</strong> "Emergency crews are dispatched! We took a shock, but the Doctor's 3-step recovery plan can restore our resilience!"
              </div>
            </div>

            {/* Score Drop Indicator */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-800 p-3 rounded-2xl border-2 border-slate-700">
                <span className="text-xs text-slate-400 font-extrabold uppercase">Sustainability Index</span>
                <div className="text-2xl font-black text-rose-400 mt-0.5 font-display">
                  {crisisResult.previousScores.sustainabilityIndex} ➔ {crisisResult.newScores.sustainabilityIndex}
                </div>
              </div>
              <div className="bg-slate-800 p-3 rounded-2xl border-2 border-slate-700">
                <span className="text-xs text-slate-400 font-extrabold uppercase">Resilience Gauge</span>
                <div className="text-2xl font-black text-sky-400 mt-0.5 font-display">
                  {crisisResult.newScores.resilienceScore} / 100
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 font-black text-base text-slate-950 rounded-2xl transition-all shadow-cartoon-sm"
            >
              Continue to City Map & Execute Recovery Plan ➔
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

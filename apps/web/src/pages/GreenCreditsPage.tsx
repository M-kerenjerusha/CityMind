import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { api } from '../api/client';
import { soundManager } from '../services/sound';
import { NpcAvatar } from '../components/art/NpcAvatar';
import { motion } from 'framer-motion';
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  TreePine,
  Bus,
  Sun,
  Gift,
} from 'lucide-react';

export const GreenCreditsPage: React.FC = () => {
  const navigate = useNavigate();
  const { cityState, refreshCity } = useGameStore();

  const [creditsData, setCreditsData] = useState<{
    creditsBalance: number;
    rules: string[];
    auditLog: any[];
  } | null>(null);

  const [redeemedPerks, setRedeemedPerks] = useState<string[]>([]);

  useEffect(() => {
    refreshCity();
    api.getCredits().then((data) => setCreditsData(data)).catch(() => {});
  }, []);

  const handleRedeemPerk = (perkId: string, cost: number) => {
    if ((cityState?.credits || 0) < cost) {
      soundManager.playError();
      alert(`Insufficient Green Credits! Requires ${cost} GC.`);
      return;
    }
    soundManager.playCoin();
    setRedeemedPerks((prev) => [...prev, perkId]);
    alert(`🎉 Perk Redeemed! Citizen happiness boosted by community reward.`);
  };

  const perks = [
    {
      id: 'urban_forest',
      title: 'Community Urban Canopy',
      cost: 40,
      icon: <TreePine className="w-8 h-8 text-emerald-400" />,
      benefit: 'Lifts citizen happiness (+3) across Outskirts & Residential.',
    },
    {
      id: 'solar_shuttle',
      title: 'Free Zero-Emission Shuttles',
      cost: 65,
      icon: <Bus className="w-8 h-8 text-sky-400" />,
      benefit: 'Connects industrial shift workers with residential hubs.',
    },
    {
      id: 'solar_festival',
      title: 'Annual Clean Energy Fair',
      cost: 50,
      icon: <Sun className="w-8 h-8 text-amber-400" />,
      benefit: 'Celebrates municipal sustainability benchmarks and boosts civic pride.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-900 text-white p-4 sm:p-7 max-w-6xl mx-auto space-y-6 select-none">
      {/* Header Banner with Large Typography */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-800/95 border-3 border-emerald-500/50 rounded-3xl p-6 shadow-cartoon flex flex-col sm:flex-row items-center justify-between gap-5"
      >
        <div className="flex items-center gap-5">
          <NpcAvatar id="rina" size="xl" animate={true} />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-display font-black text-emerald-300">
                Green Credits Market & Audit Log
              </h1>
              <span className="text-sm sm:text-base bg-emerald-500/30 text-emerald-300 border-2 border-emerald-400/60 px-4 py-1 rounded-full font-black flex items-center gap-1.5 shadow-sm">
                <Coins className="w-5 h-5 text-emerald-400" /> ${cityState?.credits || 0} GC
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 font-bold mt-1.5">
              Rewarding verified ecological improvements fairly—designed with strict anti-gaming mechanics!
            </p>
          </div>
        </div>

        <button onClick={() => navigate('/map')} className="btn-cartoon-slate text-sm sm:text-base shrink-0">
          <ArrowLeft className="w-5 h-5" /> <span>Back to Map</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fairness & Anti-Gaming Rules */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/90 border-3 border-slate-700 rounded-3xl p-6 shadow-cartoon space-y-4"
        >
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" /> Anti-Gaming Fairness Rules
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-bold">
            How CityMind Quest ensures green credits represent genuine ecological value and cannot be exploited:
          </p>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div className="bg-slate-900/80 p-4 rounded-2xl border-2 border-slate-700 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white text-sm">Strict Measurable Reductions:</strong> Credits are awarded ONLY when physical emissions or vehicle counts drop below previous levels.
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border-2 border-slate-700 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white text-sm">Zero Click-Farming:</strong> Repeatedly clicking policies without net measurable drops awards 0 credits.
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border-2 border-slate-700 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white text-sm">Zone Capping:</strong> Awards are capped at max 15 GC per zone per month to maintain geographic balance.
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border-2 border-slate-700 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white text-sm">Immutable SQLite Audit Trail:</strong> Every credit issuance is logged with timestamp, zone, metric, and delta.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Center/Right: Redeemable Perks & Audit Log */}
        <div className="lg:col-span-2 space-y-6">
          {/* Community Perks Grid */}
          <div className="bg-slate-800/90 border-3 border-slate-700 rounded-3xl p-6 shadow-cartoon space-y-4">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-400 flex items-center gap-2.5">
              <Gift className="w-6 h-6 text-amber-400" /> Community Green Rewards
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {perks.map((p) => {
                const isRedeemed = redeemedPerks.includes(p.id);
                return (
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    key={p.id}
                    className="bg-slate-900/90 p-5 rounded-3xl border-2 border-slate-700 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        {p.icon}
                        <span className="font-mono font-black text-emerald-400 text-sm bg-slate-800 px-3 py-1 rounded-xl border border-emerald-500/30">
                          ${p.cost} GC
                        </span>
                      </div>
                      <div className="font-black text-white text-base sm:text-lg font-display mb-1">{p.title}</div>
                      <div className="text-xs sm:text-sm text-slate-300 font-bold leading-snug">{p.benefit}</div>
                    </div>
                    <button
                      onClick={() => handleRedeemPerk(p.id, p.cost)}
                      disabled={isRedeemed}
                      className={`mt-4 py-2.5 rounded-2xl font-black text-sm transition-all ${
                        isRedeemed
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-cartoon-sm'
                      }`}
                    >
                      {isRedeemed ? 'Redeemed' : 'Redeem Perk'}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* SQLite Transaction Audit Log Table with Big Visible Data */}
          <div className="bg-slate-800/90 border-3 border-slate-700 rounded-3xl p-6 shadow-cartoon space-y-4">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-sky-400 flex items-center gap-2.5">
              <span>Verified Credit Audit Log (SQLite DB)</span>
            </h2>

            <div className="max-h-72 overflow-y-auto rounded-2xl border-2 border-slate-700">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 text-slate-300 uppercase text-xs font-black sticky top-0 border-b-2 border-slate-700">
                  <tr>
                    <th className="p-3">Month</th>
                    <th className="p-3">Zone</th>
                    <th className="p-3">Metric</th>
                    <th className="p-3">Reduction</th>
                    <th className="p-3 text-right">Awarded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200 font-bold">
                  {creditsData?.auditLog && creditsData.auditLog.length > 0 ? (
                    creditsData.auditLog.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-700/40">
                        <td className="p-3 font-mono text-slate-400">M{log.month}</td>
                        <td className="p-3 capitalize font-black text-white">{log.zone_id}</td>
                        <td className="p-3 uppercase font-mono text-xs text-sky-400 font-black">
                          {log.metric}
                        </td>
                        <td className="p-3 text-emerald-400 font-black">-{log.drop_amount} pts</td>
                        <td className="p-3 text-right font-black text-amber-300 text-base font-display">
                          +{log.credits_awarded} GC
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 font-bold">
                        No credit disbursements recorded yet. Implement actions that reduce emissions or traffic to earn verified credits!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

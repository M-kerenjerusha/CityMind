import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { api } from '../api/client';
import { LeaderboardEntry } from '@citymind/shared';
import { NpcAvatar } from '../components/art/NpcAvatar';
import { motion } from 'framer-motion';
import {
  Award,
  Trophy,
  ArrowLeft,
  CheckCircle,
  Lock,
  Leaf,
  ShieldCheck,
  Scale,
  Coins,
  Star,
} from 'lucide-react';

export const BadgesPage: React.FC = () => {
  const navigate = useNavigate();
  const { badges, refreshCity } = useGameStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshCity();
    api.getLeaderboard()
      .then((data) => {
        setLeaderboard(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const badgeIcons: Record<string, React.ReactNode> = {
    green_mayor: <Leaf className="w-9 h-9 text-emerald-400" />,
    crisis_survivor: <ShieldCheck className="w-9 h-9 text-sky-400" />,
    fair_leader: <Scale className="w-9 h-9 text-amber-400" />,
    budget_master: <Coins className="w-9 h-9 text-purple-400" />,
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-900 text-white p-4 sm:p-7 max-w-6xl mx-auto space-y-6 select-none">
      {/* Header Banner with Big Bold Typography */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-800/95 border-3 border-amber-500/50 rounded-3xl p-6 shadow-cartoon flex flex-col sm:flex-row items-center justify-between gap-5"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-3 border-amber-400 flex items-center justify-center text-4xl shadow-cartoon-sm">
            🏆
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-amber-300">
              Badge Hall & Global Leaderboard
            </h1>
            <p className="text-sm sm:text-base text-slate-200 font-bold mt-1">
              Celebrate your municipal distinctions and compare your term against top mayors!
            </p>
          </div>
        </div>

        <button onClick={() => navigate('/map')} className="btn-cartoon-slate text-sm sm:text-base shrink-0">
          <ArrowLeft className="w-5 h-5" /> <span>Back to Map</span>
        </button>
      </motion.div>

      {/* Badges Showcase Grid with Big Cards */}
      <div className="bg-slate-800/90 border-3 border-slate-700 rounded-3xl p-6 shadow-cartoon space-y-4">
        <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-400 flex items-center gap-2.5">
          <Award className="w-6 h-6 text-amber-400" /> Mayoral Achievement Badges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {badges.map((b) => (
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              key={b.id}
              className={`p-5 rounded-3xl border-3 flex flex-col justify-between text-center relative transition-all ${
                b.unlocked
                  ? 'bg-amber-950/50 border-amber-400 shadow-cartoon scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-sm">
                  {badgeIcons[b.id] || <Award className="w-9 h-9 text-amber-400" />}
                </div>

                <h3 className="font-display font-black text-base sm:text-lg text-white mb-1.5">{b.name}</h3>
                <p className="text-xs sm:text-sm text-slate-300 font-bold leading-snug">{b.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/80 text-xs sm:text-sm font-black">
                {b.unlocked ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-1.5 uppercase tracking-wide">
                    <CheckCircle className="w-4 h-4" /> Unlocked
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center justify-center gap-1.5 uppercase tracking-wide">
                    <Lock className="w-4 h-4" /> In Progress
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Global Leaderboard Table with Big Visible Text */}
      <div className="bg-slate-800/90 border-3 border-slate-700 rounded-3xl p-6 shadow-cartoon space-y-4">
        <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-sky-400 flex items-center gap-2.5">
          <Trophy className="w-6 h-6 text-amber-400" /> Mayoral Leaderboard (SQLite Database)
        </h2>

        <div className="overflow-x-auto rounded-2xl border-2 border-slate-700">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900 text-slate-300 uppercase text-xs font-black border-b-2 border-slate-700">
              <tr>
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Mayor & City</th>
                <th className="p-3.5">Difficulty</th>
                <th className="p-3.5 text-center">Sustainability</th>
                <th className="p-3.5 text-center">Resilience</th>
                <th className="p-3.5 text-center">Stars</th>
                <th className="p-3.5 text-right">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200 font-bold">
              {leaderboard.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-slate-700/40">
                  <td className="p-3.5 font-black text-amber-400 text-base">
                    {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
                  </td>
                  <td className="p-3.5 font-black text-white flex items-center gap-3">
                    <NpcAvatar id={entry.avatar} size="sm" animate={false} className="w-7 h-7" />
                    <div>
                      <div className="text-sm sm:text-base">{entry.playerName}</div>
                      <div className="text-xs text-slate-400 font-bold">{entry.cityName}</div>
                    </div>
                  </td>
                  <td className="p-3.5 capitalize font-extrabold text-slate-300">{entry.difficulty}</td>
                  <td className="p-3.5 text-center font-black text-emerald-400 text-base font-display">
                    {Math.round(entry.sustainabilityIndex)}
                  </td>
                  <td className="p-3.5 text-center font-black text-sky-400 text-base font-display">
                    {Math.round(entry.resilienceScore)}
                  </td>
                  <td className="p-3.5 text-center text-amber-300 font-black text-sm">
                    ⭐ {entry.starsTotal}
                  </td>
                  <td className="p-3.5 text-right font-mono font-black text-emerald-300 text-base">
                    ${entry.credits} GC
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

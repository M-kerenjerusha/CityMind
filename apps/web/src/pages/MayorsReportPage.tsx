import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { api } from '../api/client';
import { soundManager } from '../services/sound';
import { NpcAvatar } from '../components/art/NpcAvatar';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Printer,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Star,
  Coins,
  Award,
  Download,
  FileText,
} from 'lucide-react';

export const MayorsReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { cityState, scores, badges, refreshCity } = useGameStore();

  const [narrative, setNarrative] = useState<string>('');
  const [reportData, setReportData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshCity();
    api.getMayorsReport()
      .then((data) => {
        setReportData(data);
        setNarrative(data.narrative);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  // Prepare chart data from history
  const chartData = (cityState?.history || []).map((h) => ({
    month: `M${h.month}`,
    sustainabilityIndex: Math.round(h.sustainabilityIndex),
    emissions: Math.round(h.emissionsScore),
    happiness: Math.round(h.happinessScore),
    reliability: Math.round(h.reliabilityScore),
    crisisEvent: h.crisisEvent,
  }));

  const totalStars = cityState
    ? Object.values(cityState.stars).reduce((sum, s) => sum + s, 0)
    : 0;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-900 text-white p-4 sm:p-7 max-w-5xl mx-auto space-y-6 select-none">
      {/* Action Header (Hidden in print) */}
      <div className="no-print bg-slate-800/95 border-3 border-slate-700 rounded-3xl p-5 sm:p-6 shadow-cartoon flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <FileText className="w-10 h-10 text-sky-400 shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
              Official Mayor's Term Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-bold mt-0.5">
              Comprehensive municipal performance audit & executive AI evaluation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/map')} className="btn-cartoon-slate text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4" /> <span>City Map</span>
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="btn-cartoon-blue text-sm sm:text-base shine-effect"
          >
            <Printer className="w-5 h-5" /> <span>Download / Print PDF</span>
          </motion.button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-slate-900 border-4 border-slate-700 rounded-3xl p-6 sm:p-10 shadow-cartoon-lg space-y-7 text-slate-100 card-cartoon">
        {/* Document Header with Big Badges & Typography */}
        <div className="border-b-3 border-slate-700 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <NpcAvatar id={cityState?.mayorAvatar || 'mira'} size="xl" animate={false} />
            <div>
              <div className="text-xs sm:text-sm uppercase font-black text-emerald-400 tracking-wider">
                Neo Metropolis Municipal Directorate &bull; Official Record
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mt-1">
                Mayor {cityState?.mayorName || 'Alex'}'s Term Audit
              </h2>
              <div className="text-xs sm:text-sm text-slate-300 font-bold mt-2">
                City: <strong className="text-white">{cityState?.cityName}</strong> | Term: Month 1
                to Month {cityState?.month} | Council: <span className="capitalize font-black text-amber-300">{cityState?.difficulty}</span>
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l-3 sm:border-slate-800 sm:pl-8">
            <div className="text-xs sm:text-sm text-slate-400 font-black uppercase tracking-wider">
              Final Sustainability Index
            </div>
            <div className="text-5xl sm:text-6xl font-display font-black text-emerald-400 mt-1">
              {scores ? Math.round(scores.sustainabilityIndex) : 75}
              <span className="text-lg text-slate-400 font-bold"> / 100</span>
            </div>
            <div className="text-sm font-black text-sky-400 mt-1.5">
              Resilience Score: {scores ? Math.round(scores.resilienceScore) : 80} / 100
            </div>
          </div>
        </div>

        {/* AI Executive Narrative with High-Contrast Large Text */}
        <div className="bg-slate-800/90 border-2 border-purple-500/50 rounded-3xl p-6 space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-purple-300 uppercase tracking-wider">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>AI Executive Evaluation (Google Gemini / Grounded Rule Engine)</span>
          </div>
          <p className="text-base sm:text-lg leading-relaxed text-slate-100 whitespace-pre-line font-bold">
            {narrative || 'Compiling mayoral executive evaluation...'}
          </p>
        </div>

        {/* Key Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-800 p-4 rounded-2xl border-2 border-slate-700">
            <div className="text-xs sm:text-sm text-slate-400 font-extrabold uppercase">Emissions Score</div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 font-display">
              {scores ? Math.round(scores.emissionsScore) : 0}
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border-2 border-slate-700">
            <div className="text-xs sm:text-sm text-slate-400 font-extrabold uppercase">Citizen Happiness</div>
            <div className="text-3xl sm:text-4xl font-black text-sky-400 mt-1 font-display">
              {scores ? Math.round(scores.happinessScore) : 0}
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border-2 border-slate-700">
            <div className="text-xs sm:text-sm text-slate-400 font-extrabold uppercase">Grid Reliability</div>
            <div className="text-3xl sm:text-4xl font-black text-purple-400 mt-1 font-display">
              {scores ? Math.round(scores.reliabilityScore) : 0}
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border-2 border-slate-700">
            <div className="text-xs sm:text-sm text-slate-400 font-extrabold uppercase">Regional Equity</div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-1 font-display">
              {scores ? Math.round(scores.equityScore) : 0}
            </div>
          </div>
        </div>

        {/* Sustainability Index by Month Line Chart */}
        <div className="bg-slate-800/90 border-2 border-slate-700 rounded-3xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-200">
              Sustainability Index Trajectory & Events
            </h3>
            <span className="text-xs sm:text-sm text-slate-300 font-bold bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
              Monthly Timeline
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 13, fontWeight: 'bold' }} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 13, fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '2px solid #334155',
                    borderRadius: '1rem',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 'bold',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sustainabilityIndex"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{ fill: '#10b981', r: 6 }}
                  activeDot={{ r: 9 }}
                  name="Sustainability Index"
                />
                <Line
                  type="monotone"
                  dataKey="happiness"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  name="Happiness"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Breakdown Table with Big Clear Rows */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-200">
            Final Neighborhood Metrics Breakdown
          </h3>
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-700">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-800 text-slate-300 uppercase text-xs font-black border-b-2 border-slate-700">
                <tr>
                  <th className="p-3.5">Zone</th>
                  <th className="p-3.5 text-center">Emissions</th>
                  <th className="p-3.5 text-center">Energy Load</th>
                  <th className="p-3.5 text-center">Traffic</th>
                  <th className="p-3.5 text-center">Happiness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200 font-bold">
                {cityState &&
                  Object.values(cityState.zones).map((z) => (
                    <tr key={z.id}>
                      <td className="p-3.5 font-black text-white text-sm sm:text-base">{z.name}</td>
                      <td className="p-3.5 text-center text-rose-400 font-black text-base">{z.emissions}</td>
                      <td className="p-3.5 text-center text-amber-400 font-black text-base">{z.energy_load}</td>
                      <td className="p-3.5 text-center text-sky-400 font-black text-base">{z.traffic}</td>
                      <td className="p-3.5 text-center text-emerald-400 font-black text-base">{z.happiness}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stamp */}
        <div className="border-t-3 border-slate-700 pt-5 flex items-center justify-between text-xs sm:text-sm text-slate-300 font-bold">
          <div>
            Certified by Neo Metropolis Municipal Commission &bull; UN SDGs 11, 13 & 7
          </div>
          <div className="font-mono text-sm font-black text-amber-300">
            Total Stars: ⭐ {totalStars} | Green Credits: ${cityState?.credits} GC
          </div>
        </div>
      </div>
    </div>
  );
};

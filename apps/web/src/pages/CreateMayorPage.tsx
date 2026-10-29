import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { api } from '../api/client';
import { soundManager } from '../services/sound';
import { NpcAvatar } from '../components/art/NpcAvatar';
import { motion } from 'framer-motion';
import { RealDataPayload, Zone, ZoneId } from '@citymind/shared';
import {
  Sparkles,
  ArrowRight,
  Search,
  Upload,
  Globe2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const CreateMayorPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshCity } = useGameStore();

  const [mayorName, setMayorName] = useState('Alex');
  const [avatar, setAvatar] = useState('mira');
  const [cityInput, setCityInput] = useState('London');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  // Real data state
  const [realData, setRealData] = useState<RealDataPayload | null>(null);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [realDataError, setRealDataError] = useState<string | null>(null);
  const [useSampleCity, setUseSampleCity] = useState(false);

  // Custom JSON/CSV import modal/state
  const [customImportNotice, setCustomImportNotice] = useState<string | null>(null);

  const avatarsList = [
    { id: 'mira', name: 'Mentor Mira' },
    { id: 'volt', name: 'Professor Volt' },
    { id: 'zoom', name: 'Captain Zoom' },
    { id: 'rina', name: 'Rina Recycler' },
    { id: 'penny', name: 'Penny Treasurer' },
  ];

  const handleFetchCityData = async (queryToUse?: string) => {
    const q = queryToUse || cityInput;
    if (!q.trim()) return;

    soundManager.playClick();
    setIsLoadingRealData(true);
    setRealDataError(null);
    setUseSampleCity(false);

    try {
      const payload = await api.getRealData(q);
      setRealData(payload);
      soundManager.playCoin();
    } catch (err: any) {
      setRealDataError(`Could not fetch data for "${q}": ${err.message}. Using bundled offline fallback.`);
    } finally {
      setIsLoadingRealData(false);
    }
  };

  const handleSelectSample = () => {
    soundManager.playClick();
    setUseSampleCity(true);
    setRealData(null);
    setRealDataError(null);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.zones && parsed.zones.industrial) {
          setRealData({
            cityName: parsed.cityName || 'Imported Custom City',
            latitude: 0,
            longitude: 0,
            temperatureC: 22,
            aqi: 45,
            pm25: 12,
            pm10: 20,
            weatherCondition: 'Custom Dataset',
            source: 'Custom JSON File Upload',
            timestamp: new Date().toISOString(),
            zones: parsed.zones,
          });
          setCustomImportNotice('Successfully imported custom zone parameters!');
          soundManager.playSuccess();
        } else {
          alert('Invalid format. JSON must include a "zones" object with industrial, residential, downtown, outskirts.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleStartGame = async () => {
    soundManager.playClick();

    const cityName = useSampleCity
      ? 'Sample Metropolis'
      : realData
      ? realData.cityName
      : cityInput || 'Neo Metropolis';

    try {
      await api.createSession({
        playerName: mayorName.trim() || 'Alex',
        cityName,
        avatar,
        difficulty,
        realDataPayload: useSampleCity ? undefined : realData,
      });

      await refreshCity();
      soundManager.playSuccess();
      navigate('/map');
    } catch (err: any) {
      alert(`Could not inaugurate city: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col items-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        {/* Header with Big Bold Typography */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-emerald-500/20 border-3 border-emerald-500 rounded-3xl text-4xl mb-3 shadow-cartoon-sm">
            🏛️
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight">
            Inaugurate Your Administration
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-bold mt-2">
            Choose your mayor persona, connect real meteorological data, and set council difficulty!
          </p>
        </div>

        <div className="space-y-7">
          {/* 1. Mayor Persona & Avatar */}
          <div className="bg-slate-800/95 border-3 border-slate-700 rounded-3xl p-6 shadow-cartoon">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2.5">
              <span>1.</span> Choose Mayor Persona
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs sm:text-sm text-slate-200 font-extrabold uppercase block mb-2">
                  Mayor Full Name
                </label>
                <input
                  type="text"
                  value={mayorName}
                  onChange={(e) => setMayorName(e.target.value)}
                  maxLength={25}
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-5 py-3 text-white text-lg font-black focus:outline-none focus:border-emerald-500 shadow-sm"
                  placeholder="Enter Mayor Name"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm text-slate-200 font-extrabold uppercase block mb-2">
                  Select Avatar Character
                </label>
                <div className="flex gap-2.5">
                  {avatarsList.map((av) => (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      key={av.id}
                      onClick={() => {
                        soundManager.playClick();
                        setAvatar(av.id);
                      }}
                      className={`p-1.5 rounded-2xl border-3 transition-all ${
                        avatar === av.id
                          ? 'border-emerald-400 bg-emerald-500/25 scale-105 shadow-md'
                          : 'border-slate-700 hover:border-slate-500 bg-slate-900/60 opacity-60 hover:opacity-100'
                      }`}
                      title={av.name}
                    >
                      <NpcAvatar id={av.id} size="md" animate={avatar === av.id} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. City Location & Real Data Layer */}
          <div className="bg-slate-800/95 border-3 border-slate-700 rounded-3xl p-6 shadow-cartoon">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-sky-400 mb-4 flex items-center gap-2.5">
              <Globe2 className="w-5 h-5 text-sky-400" />
              <span>2. City Environment & Meteorological Data Layer</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 mb-3.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={cityInput}
                  disabled={useSampleCity}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchCityData()}
                  placeholder="Search real city (e.g., Tokyo, London, Paris, Delhi)..."
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded-2xl px-5 py-3.5 text-white text-base sm:text-lg font-bold focus:outline-none focus:border-sky-500 disabled:opacity-40"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFetchCityData()}
                disabled={isLoadingRealData || useSampleCity || !cityInput.trim()}
                className="px-6 py-3.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2.5 transition-all text-sm sm:text-base shadow-sm"
              >
                <Search className="w-5 h-5" />
                <span>{isLoadingRealData ? 'Fetching...' : 'Fetch Open-Meteo'}</span>
              </motion.button>
              <button
                onClick={handleSelectSample}
                className={`px-5 py-3.5 rounded-2xl font-black text-sm sm:text-base border-2 transition-all ${
                  useSampleCity
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md scale-105'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                Sample Model City
              </button>
            </div>

            {/* Honest Data Source Disclosure */}
            <div className="text-xs sm:text-sm text-slate-300 bg-slate-900/80 p-4 rounded-2xl border border-slate-700 flex items-start gap-3 leading-relaxed">
              <HelpCircle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Data Integrity Disclosure:</strong> Real metrics
                (Air Quality AQI, PM2.5/PM10, Temperature) are queried from Open-Meteo European/ECMWF APIs.
                Traffic, baseline electrical grid loads, and citizen happiness are modeled simulation proxies calibrated to regional density.
              </div>
            </div>

            {/* Display fetched real data stats */}
            {realData && !useSampleCity && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-sky-950/80 border-2 border-sky-500 rounded-2xl text-xs sm:text-sm space-y-3"
              >
                <div className="flex items-center justify-between font-black text-sky-300">
                  <span className="flex items-center gap-2 text-base">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Resolved: {realData.cityName}
                  </span>
                  <span className="text-xs text-sky-300 font-mono bg-sky-900/60 px-2.5 py-1 rounded-lg">
                    {realData.weatherCondition} ({realData.temperatureC}°C)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-xs font-bold uppercase block">Real AQI</span>
                    <strong className="text-white text-lg font-black font-display">{realData.aqi}</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-xs font-bold uppercase block">PM2.5</span>
                    <strong className="text-white text-lg font-black font-display">{realData.pm25} µg/m³</strong>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-xs font-bold uppercase block">PM10</span>
                    <strong className="text-white text-lg font-black font-display">{realData.pm10} µg/m³</strong>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-semibold">
                  Source: <em>{realData.source}</em>
                </div>
              </motion.div>
            )}

            {/* Custom File Upload Option */}
            <div className="mt-4 pt-3.5 border-t border-slate-700 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-300 font-bold">Have a custom zone dataset?</span>
              <label className="cursor-pointer text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-black">
                <Upload className="w-4 h-4" />
                <span>Upload Custom JSON</span>
                <input type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
              </label>
            </div>
            {customImportNotice && (
              <div className="mt-1 text-xs text-emerald-300 font-bold">{customImportNotice}</div>
            )}
          </div>

          {/* 3. Council Difficulty with Big Cards */}
          <div className="bg-slate-800/95 border-3 border-slate-700 rounded-3xl p-6 shadow-cartoon">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2.5">
              <span>3.</span> Council Difficulty & Budget
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  id: 'easy',
                  label: 'Easy Council',
                  budget: 120,
                  desc: 'Generous federal grants. Recommended for first-time mayors.',
                  color: 'border-emerald-400 bg-emerald-950/60',
                },
                {
                  id: 'normal',
                  label: 'Normal Council',
                  budget: 100,
                  desc: 'Standard municipal treasury. Realistic tradeoffs.',
                  color: 'border-amber-400 bg-amber-950/60',
                },
                {
                  id: 'hard',
                  label: 'Fiscal Austerity',
                  budget: 70,
                  desc: 'Tight revenue limits. Every dollar must be guarded.',
                  color: 'border-rose-400 bg-rose-950/60',
                },
              ].map((d) => (
                <motion.button
                  key={d.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    soundManager.playClick();
                    setDifficulty(d.id as any);
                  }}
                  className={`p-4 rounded-3xl border-3 text-left transition-all ${
                    difficulty === d.id
                      ? `${d.color} shadow-lg scale-105`
                      : 'border-slate-700 bg-slate-900/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="font-display font-black text-lg text-white flex items-center justify-between">
                    <span>{d.label}</span>
                    <span className="text-sm text-amber-300 font-mono bg-slate-900 px-2.5 py-1 rounded-xl border border-amber-400/40">
                      ${d.budget}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 font-semibold mt-2 leading-snug">{d.desc}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Final Large Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStartGame}
            className="shine-effect w-full py-5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xl sm:text-2xl rounded-2xl border-b-4 border-emerald-700 shadow-cartoon flex items-center justify-center gap-3 transition-all tracking-wide"
          >
            <span>TAKE MAYORAL OATH & ENTER CITY</span>
            <ArrowRight className="w-7 h-7" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

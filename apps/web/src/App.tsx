import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import { Navbar } from './components/layout/Navbar';
import { GemiDrawer } from './components/layout/GemiDrawer';
import { ChaosModal } from './components/modals/ChaosModal';
import { HowToPlayModal } from './components/modals/HowToPlayModal';

// Code-split routes for optimal performance
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const CreateMayorPage = lazy(() => import('./pages/CreateMayorPage').then((m) => ({ default: m.CreateMayorPage })));
const CityMapPage = lazy(() => import('./pages/CityMapPage').then((m) => ({ default: m.CityMapPage })));
const LevelPage = lazy(() => import('./pages/LevelPage').then((m) => ({ default: m.LevelPage })));
const AiAdvisorPage = lazy(() => import('./pages/AiAdvisorPage').then((m) => ({ default: m.AiAdvisorPage })));
const GreenCreditsPage = lazy(() => import('./pages/GreenCreditsPage').then((m) => ({ default: m.GreenCreditsPage })));
const BadgesPage = lazy(() => import('./pages/BadgesPage').then((m) => ({ default: m.BadgesPage })));
const MayorsReportPage = lazy(() => import('./pages/MayorsReportPage').then((m) => ({ default: m.MayorsReportPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const LoadingFallback: React.FC = () => (
  <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-slate-900 text-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span className="font-display font-bold text-sm text-emerald-400">Loading Municipal Simulation...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  const location = useLocation();
  const { fetchInitial } = useGameStore();

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const isSplash = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {!isSplash && <Navbar />}

      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateMayorPage />} />
            <Route path="/map" element={<CityMapPage />} />
            <Route path="/level/:levelId" element={<LevelPage />} />
            <Route path="/ai" element={<AiAdvisorPage />} />
            <Route path="/credits" element={<GreenCreditsPage />} />
            <Route path="/badges" element={<BadgesPage />} />
            <Route path="/report" element={<MayorsReportPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Global Interactive Modals & Drawers */}
      <GemiDrawer />
      <ChaosModal />
      <HowToPlayModal />
    </div>
  );
};

export default App;

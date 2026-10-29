import { create } from 'zustand';
import { Badge, CityScores, CityState, LevelInfo } from '@citymind/shared';
import { api } from '../api/client';
import { soundManager } from '../services/sound';

interface GameStore {
  cityState: CityState | null;
  scores: CityScores | null;
  badges: Badge[];
  levels: LevelInfo[];
  isLoading: boolean;
  isMuted: boolean;
  isGemiOpen: boolean;
  isChaosModalOpen: boolean;
  isHowToPlayOpen: boolean;
  activeCrisisNotice: any | null;

  // Actions
  fetchInitial: () => Promise<void>;
  refreshCity: () => Promise<void>;
  refreshLevels: () => Promise<void>;
  toggleMute: () => void;
  setGemiOpen: (open: boolean) => void;
  setChaosModalOpen: (open: boolean) => void;
  setHowToPlayOpen: (open: boolean) => void;
  setActiveCrisisNotice: (notice: any | null) => void;
  resetGame: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  cityState: null,
  scores: null,
  badges: [],
  levels: [],
  isLoading: true,
  isMuted: soundManager.getMuted(),
  isGemiOpen: false,
  isChaosModalOpen: false,
  isHowToPlayOpen: false,
  activeCrisisNotice: null,

  fetchInitial: async () => {
    set({ isLoading: true });
    try {
      const [cityData, levelsData] = await Promise.all([
        api.getCity(),
        api.getLevels(),
      ]);
      set({
        cityState: cityData.state,
        scores: cityData.scores,
        badges: cityData.badges,
        levels: levelsData,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to load initial game data:', e);
      set({ isLoading: false });
    }
  },

  refreshCity: async () => {
    try {
      const cityData = await api.getCity();
      set({
        cityState: cityData.state,
        scores: cityData.scores,
        badges: cityData.badges,
      });
    } catch (e) {
      console.error('Failed to refresh city data:', e);
    }
  },

  refreshLevels: async () => {
    try {
      const levelsData = await api.getLevels();
      set({ levels: levelsData });
    } catch (e) {
      console.error('Failed to refresh levels:', e);
    }
  },

  toggleMute: () => {
    const muted = soundManager.toggleMute();
    set({ isMuted: muted });
  },

  setGemiOpen: (open: boolean) => set({ isGemiOpen: open }),
  setChaosModalOpen: (open: boolean) => set({ isChaosModalOpen: open }),
  setHowToPlayOpen: (open: boolean) => set({ isHowToPlayOpen: open }),
  setActiveCrisisNotice: (notice: any | null) => set({ activeCrisisNotice: notice }),
  resetGame: async () => {
    try {
      await api.resetCity();
      await get().fetchInitial();
    } catch (e) {
      console.error('Failed to reset city:', e);
    }
  },
}));

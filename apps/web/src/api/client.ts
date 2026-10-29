import {
  CityScores,
  CityState,
  DoctorRecoveryPlan,
  LeaderboardEntry,
  LevelInfo,
  PrioritySliders,
  RealDataPayload,
  RecommendationResult,
  SimulationResult,
} from '@citymind/shared';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json = await res.json();
  if (!json.ok) {
    throw new Error(json.error || 'Server request failed');
  }
  return json.data;
}

export const api = {
  getCity: () => request<{ state: CityState; scores: CityScores; badges: any[]; actionsCatalog: any[] }>('/city'),

  previewAction: (actionId: string) =>
    request<{
      actionId: string;
      previousState: CityState;
      previewState: CityState;
      previousScores: CityScores;
      previewScores: CityScores;
      delta: any;
    }>('/preview', {
      method: 'POST',
      body: JSON.stringify({ actionId }),
    }),

  implementAction: (actionId: string) =>
    request<SimulationResult>('/implement', {
      method: 'POST',
      body: JSON.stringify({ actionId }),
    }),

  getRecommendation: (weights?: PrioritySliders) => {
    const params = weights
      ? `?env=${weights.environment}&hap=${weights.happiness}&cost=${weights.cost}&rel=${weights.reliability}`
      : '';
    return request<RecommendationResult>(`/recommendation${params}`);
  },

  updatePriorities: (priorities: PrioritySliders) =>
    request<{ priorities: PrioritySliders; scores: CityScores; recommendation: RecommendationResult }>(
      '/priorities',
      {
        method: 'POST',
        body: JSON.stringify(priorities),
      }
    ),

  triggerCrisis: (crisisId: string, severity: 'mild' | 'severe' | 'catastrophic' = 'severe') =>
    request<any>('/crisis', {
      method: 'POST',
      body: JSON.stringify({ crisisId, severity }),
    }),

  getDoctorPlan: () => request<DoctorRecoveryPlan>('/doctor'),

  getScoreExplanation: () => request<any>('/explain'),

  getCredits: () =>
    request<{ creditsBalance: number; rules: string[]; auditLog: any[] }>('/credits'),

  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') =>
    request<any>('/difficulty', {
      method: 'POST',
      body: JSON.stringify({ difficulty }),
    }),

  resetCity: () => request<any>('/reset', { method: 'POST' }),

  createSession: (payload: {
    playerName: string;
    cityName: string;
    avatar: string;
    difficulty: string;
    realDataPayload?: any;
  }) =>
    request<any>('/session', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getLeaderboard: () => request<LeaderboardEntry[]>('/leaderboard'),

  getLevels: () => request<LevelInfo[]>('/levels'),

  completeLevel: (levelId: string, stars: number) =>
    request<any>('/levels/complete', {
      method: 'POST',
      body: JSON.stringify({ levelId, stars }),
    }),

  getRealData: (city: string) =>
    request<RealDataPayload>(`/realdata?city=${encodeURIComponent(city)}`),

  aiChat: (message: string) =>
    request<{ reply: string; isOfflineAdvisor: boolean; suggestedQuestions?: string[] }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  aiExplain: (npcId: string, levelId: string, actionId?: string) =>
    request<{ reply: string; isOfflineAdvisor: boolean }>('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ npcId, levelId, actionId }),
    }),

  aiWhatIf: (query: string) =>
    request<{
      reply: string;
      isOfflineAdvisor: boolean;
      simulationData?: any;
    }>('/ai/whatif', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  getMayorsReport: () => request<any>('/report'),
};

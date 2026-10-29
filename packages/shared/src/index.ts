export type ZoneId = 'industrial' | 'residential' | 'downtown' | 'outskirts';

export interface Zone {
  id: ZoneId;
  name: string;
  traffic: number;      // 0 - 100
  emissions: number;    // 0 - 100
  energy_load: number;  // 0 - 100
  happiness: number;    // 0 - 100
  description?: string;
}

export interface PrioritySliders {
  environment: number; // default 40
  happiness: number;   // default 30
  cost: number;        // default 20
  reliability: number; // default 10
}

export interface CityScores {
  emissionsScore: number;     // 100 - average emissions
  happinessScore: number;     // average happiness
  reliabilityScore: number;   // 100 - average energy load
  budgetScore: number;        // remaining budget
  equityScore: number;        // 100 - (highest zone happiness - lowest zone happiness)
  sustainabilityIndex: number;// weighted average normalized to 100
  resilienceScore: number;    // resilience gauge
}

export type ActionId =
  | 'buses'
  | 'signals'
  | 'road'
  | 'solar'
  | 'battery'
  | 'recycling'
  | 'congestion';

export interface ActionDefinition {
  id: ActionId;
  name: string;
  cost: number;
  category: 'transit' | 'energy' | 'waste' | 'planning';
  description: string;
  icon: string;
  effectsSummary: string;
}

export type CrisisId = 'heatwave' | 'factory_closing' | 'transport_strike';
export type CrisisSeverity = 'mild' | 'severe' | 'catastrophic';

export interface CrisisDefinition {
  id: CrisisId;
  name: string;
  description: string;
  icon: string;
}

export interface ActiveCrisis {
  id: CrisisId;
  name: string;
  severity: CrisisSeverity;
  startedMonth: number;
  mitigationPercent: number;
  mitigationMessage: string;
}

export interface CityStateHistoryEntry {
  month: number;
  actionTaken?: string;
  crisisEvent?: string;
  sustainabilityIndex: number;
  emissionsScore: number;
  happinessScore: number;
  budgetScore: number;
  reliabilityScore: number;
  equityScore: number;
  resilienceScore: number;
  timestamp: string;
}

export interface GreenCreditLog {
  id: string;
  month: number;
  zoneId: ZoneId;
  metric: 'emissions' | 'traffic';
  dropAmount: number;
  creditsAwarded: number;
  reason: string;
  timestamp: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAtMonth?: number;
}

export interface CityState {
  month: number;
  budget: number;
  initialBudget: number;
  difficulty: 'easy' | 'normal' | 'hard';
  cityName: string;
  mayorName: string;
  mayorAvatar: string;
  isRealData: boolean;
  realDataSource?: string;
  realDataTimestamp?: string;
  zones: Record<ZoneId, Zone>;
  actionsTaken: Record<ActionId, number>; // purchase count: 0, 1, or 2
  history: CityStateHistoryEntry[];
  activeCrisis: ActiveCrisis | null;
  crisisDamageRemaining: number;
  monthsSinceCrisis: number;
  lowestSustainabilityIndex: number;
  baselineSustainabilityIndex: number;
  credits: number;
  xp: number;
  levelCompleted: Record<string, boolean>;
  stars: Record<string, number>;
  priorities: PrioritySliders;
}

export interface SimulationResult {
  previousState: CityState;
  newState: CityState;
  previousScores: CityScores;
  newScores: CityScores;
  scoreDelta: number;
  topContributors: Array<{
    factor: string;
    delta: number;
    explanation: string;
    isPositive: boolean;
  }>;
  creditsEarned: number;
  creditsLog: GreenCreditLog[];
  badgesUnlocked: Badge[];
}

export interface RecommendationItem {
  action: ActionDefinition;
  score: number;
  affordable: boolean;
  timesPurchased: number;
  pros: string;
  cons: string;
}

export interface RecommendationResult {
  bestAction: ActionDefinition;
  bestScore: number;
  reason: string;
  runnerUpAction: ActionDefinition | null;
  runnerUpReason: string;
  rankedActions: RecommendationItem[];
}

export interface DoctorRecoveryPlan {
  crisisName: string;
  severity: CrisisSeverity;
  estimatedRecoveryMonths: number;
  naturalRecoveryRatePercent: number;
  steps: Array<{
    stepNumber: number;
    action: ActionDefinition;
    rationale: string;
    acceleratedRecoveryBonus: string;
  }>;
}

export interface RealDataPayload {
  cityName: string;
  latitude: number;
  longitude: number;
  temperatureC: number;
  aqi: number;
  pm25: number;
  pm10: number;
  weatherCondition: string;
  source: string;
  timestamp: string;
  zones: Record<ZoneId, Zone>;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  cityName: string;
  avatar: string;
  difficulty: string;
  sustainabilityIndex: number;
  resilienceScore: number;
  starsTotal: number;
  credits: number;
  date: string;
}

export type LevelId = 'tutorial' | 'power' | 'transit' | 'waste' | 'hall' | 'crisis';

export interface LevelInfo {
  id: LevelId;
  order: number;
  title: string;
  subtitle: string;
  npcName: string;
  npcRole: string;
  npcAvatar: string;
  buildingId: string;
  missionGoal: string;
  targetCriteria: string;
  allowedActionIds: ActionId[];
  initialDialogue?: string;
  successDialogue?: string;
  unlocked: boolean;
  completed: boolean;
  stars: number;
}

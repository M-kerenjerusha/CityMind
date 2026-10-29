import {
  ActionDefinition,
  ActionId,
  CityScores,
  CityState,
  SimulationResult,
  Zone,
  ZoneId,
} from '@citymind/shared';
import actionsData from '../data/actions.json';
import defaultCityData from '../data/city.json';
import { calculateScores, clamp, roundTo } from './scores';
import { awardGreenCredits } from './credits';
import { checkAndAwardBadges } from './badges';

export const ACTIONS_CATALOG: ActionDefinition[] = actionsData as any;

export function getActionById(actionId: ActionId): ActionDefinition | undefined {
  return ACTIONS_CATALOG.find((a) => a.id === actionId);
}

export function createInitialCityState(override?: Partial<CityState>): CityState {
  const base = JSON.parse(JSON.stringify(defaultCityData)) as CityState;
  const initialBudget =
    override?.difficulty === 'easy' ? 120 : override?.difficulty === 'hard' ? 70 : 100;

  const state: CityState = {
    ...base,
    difficulty: override?.difficulty || 'normal',
    budget: initialBudget,
    initialBudget,
    cityName: override?.cityName || base.cityName,
    mayorName: override?.mayorName || base.mayorName,
    mayorAvatar: override?.mayorAvatar || base.mayorAvatar,
    isRealData: override?.isRealData || false,
    realDataSource: override?.realDataSource,
    realDataTimestamp: override?.realDataTimestamp,
    actionsTaken: {
      buses: 0,
      signals: 0,
      road: 0,
      solar: 0,
      battery: 0,
      recycling: 0,
      congestion: 0,
    },
    history: [],
    activeCrisis: null,
    crisisDamageRemaining: 0,
    monthsSinceCrisis: 0,
    lowestSustainabilityIndex: 0,
    baselineSustainabilityIndex: 0,
    credits: 25,
    xp: 0,
    levelCompleted: {
      tutorial: true,
      power: false,
      transit: false,
      waste: false,
      hall: false,
      crisis: false,
    },
    stars: {
      tutorial: 3,
      power: 0,
      transit: 0,
      waste: 0,
      hall: 0,
      crisis: 0,
    },
    priorities: base.priorities || {
      environment: 40,
      happiness: 30,
      cost: 20,
      reliability: 10,
    },
    ...override,
    zones: override?.zones || base.zones,
  };

  const initialScores = calculateScores(state);
  state.baselineSustainabilityIndex = initialScores.sustainabilityIndex;
  state.lowestSustainabilityIndex = initialScores.sustainabilityIndex;

  state.history.push({
    month: state.month,
    actionTaken: 'Initial City Inauguration',
    sustainabilityIndex: initialScores.sustainabilityIndex,
    emissionsScore: initialScores.emissionsScore,
    happinessScore: initialScores.happinessScore,
    budgetScore: initialScores.budgetScore,
    reliabilityScore: initialScores.reliabilityScore,
    equityScore: initialScores.equityScore,
    resilienceScore: initialScores.resilienceScore,
    timestamp: new Date().toISOString(),
  });

  return state;
}

/**
 * PURE function that simulates an action on a city state and returns a new state.
 * Never mutates the input state.
 */
export function simulate(state: CityState, actionId: ActionId): CityState {
  const action = getActionById(actionId);
  if (!action) {
    throw new Error(`Unknown action: ${actionId}`);
  }

  const timesPurchased = state.actionsTaken[actionId] || 0;
  if (timesPurchased >= 2) {
    throw new Error(
      `Action "${action.name}" has already been implemented twice (maximum limit reached).`
    );
  }

  if (state.budget < action.cost) {
    throw new Error(
      `Insufficient budget: "${action.name}" costs $${action.cost}, but current treasury only has $${state.budget}.`
    );
  }

  // Deep clone state to guarantee purity
  const nextState: CityState = JSON.parse(JSON.stringify(state));

  // Determine multiplier for diminishing returns (1st = 1.0, 2nd = 0.5)
  const multiplier = timesPurchased === 0 ? 1.0 : 0.5;

  // Deduct cost and record purchase
  nextState.budget = roundTo(nextState.budget - action.cost);
  nextState.actionsTaken[actionId] = timesPurchased + 1;

  // Apply action effects to zones
  const rawActionConfig = (actionsData as any[]).find((a) => a.id === actionId);

  if (rawActionConfig.zoneSpecificDeltas) {
    for (const [zId, deltas] of Object.entries<any>(rawActionConfig.zoneSpecificDeltas)) {
      const zone = nextState.zones[zId as ZoneId];
      if (zone) {
        if (deltas.traffic) zone.traffic = clamp(roundTo(zone.traffic + deltas.traffic * multiplier));
        if (deltas.emissions) zone.emissions = clamp(roundTo(zone.emissions + deltas.emissions * multiplier));
        if (deltas.energy_load) zone.energy_load = clamp(roundTo(zone.energy_load + deltas.energy_load * multiplier));
        if (deltas.happiness) zone.happiness = clamp(roundTo(zone.happiness + deltas.happiness * multiplier));
      }
    }
  } else if (rawActionConfig.targetZones && rawActionConfig.deltas) {
    const targetZones: ZoneId[] = rawActionConfig.targetZones;
    const deltas = rawActionConfig.deltas;

    for (const zId of targetZones) {
      const zone = nextState.zones[zId];
      if (zone) {
        if (deltas.traffic) zone.traffic = clamp(roundTo(zone.traffic + deltas.traffic * multiplier));
        if (deltas.emissions) zone.emissions = clamp(roundTo(zone.emissions + deltas.emissions * multiplier));
        if (deltas.energy_load) zone.energy_load = clamp(roundTo(zone.energy_load + deltas.energy_load * multiplier));
        if (deltas.happiness) zone.happiness = clamp(roundTo(zone.happiness + deltas.happiness * multiplier));
      }
    }
  }

  // Natural crisis recovery: each month recovers 15% of remaining crisis damage
  if (nextState.crisisDamageRemaining > 0) {
    nextState.crisisDamageRemaining = roundTo(nextState.crisisDamageRemaining * 0.85);
    nextState.monthsSinceCrisis += 1;
    if (nextState.crisisDamageRemaining < 1) {
      nextState.crisisDamageRemaining = 0;
      nextState.activeCrisis = null;
    }
  }

  // Advance month
  nextState.month += 1;

  // Update lowest sustainability index if new index is lower
  const simScores = calculateScores(nextState);
  if (simScores.sustainabilityIndex < nextState.lowestSustainabilityIndex) {
    nextState.lowestSustainabilityIndex = simScores.sustainabilityIndex;
  }

  return nextState;
}

/**
 * Executes implementAction on a state, generating audit logs, credits, badges, and score deltas.
 */
export function implementAction(state: CityState, actionId: ActionId): SimulationResult {
  const action = getActionById(actionId);
  if (!action) {
    throw new Error(`Unknown action: ${actionId}`);
  }

  const previousScores = calculateScores(state);
  const nextState = simulate(state, actionId);
  const newScores = calculateScores(nextState);

  // Calculate green credits based on verified metric drops
  const creditResult = awardGreenCredits(state, nextState);
  nextState.credits += creditResult.totalCreditsAwarded;

  // Add XP for taking decisions
  nextState.xp += 50;

  // Check badges
  const unlockedBadges = checkAndAwardBadges(nextState, newScores);

  // Compute top 3 contributors for "Why did my score change?"
  const topContributors = computeScoreContributors(previousScores, newScores, action.name);

  // Log to history
  nextState.history.push({
    month: nextState.month,
    actionTaken: action.name,
    sustainabilityIndex: newScores.sustainabilityIndex,
    emissionsScore: newScores.emissionsScore,
    happinessScore: newScores.happinessScore,
    budgetScore: newScores.budgetScore,
    reliabilityScore: newScores.reliabilityScore,
    equityScore: newScores.equityScore,
    resilienceScore: newScores.resilienceScore,
    timestamp: new Date().toISOString(),
  });

  return {
    previousState: state,
    newState: nextState,
    previousScores,
    newScores,
    scoreDelta: roundTo(newScores.sustainabilityIndex - previousScores.sustainabilityIndex),
    topContributors,
    creditsEarned: creditResult.totalCreditsAwarded,
    creditsLog: creditResult.logs,
    badgesUnlocked: unlockedBadges,
  };
}

/**
 * Computes top 3 contributors explaining why the score changed.
 */
export function computeScoreContributors(
  prevScores: CityScores,
  newScores: CityScores,
  actionOrEventName: string
): Array<{ factor: string; delta: number; explanation: string; isPositive: boolean }> {
  const changes = [
    {
      factor: 'Emissions Reduction',
      delta: roundTo(newScores.emissionsScore - prevScores.emissionsScore),
      explanation: `${actionOrEventName} shifted average city emissions by ${Math.abs(roundTo(newScores.emissionsScore - prevScores.emissionsScore))} pts.`,
    },
    {
      factor: 'Citizen Happiness',
      delta: roundTo(newScores.happinessScore - prevScores.happinessScore),
      explanation: `Community satisfaction shifted by ${Math.abs(roundTo(newScores.happinessScore - prevScores.happinessScore))} pts.`,
    },
    {
      factor: 'Grid Reliability',
      delta: roundTo(newScores.reliabilityScore - prevScores.reliabilityScore),
      explanation: `Energy load headroom shifted by ${Math.abs(roundTo(newScores.reliabilityScore - prevScores.reliabilityScore))} pts.`,
    },
    {
      factor: 'Treasury Budget',
      delta: roundTo(newScores.budgetScore - prevScores.budgetScore),
      explanation: `Municipal funds changed by $${Math.abs(roundTo(newScores.budgetScore - prevScores.budgetScore))}.`,
    },
    {
      factor: 'Neighborhood Equity',
      delta: roundTo(newScores.equityScore - prevScores.equityScore),
      explanation: `Happiness balance between highest and lowest zone shifted by ${Math.abs(roundTo(newScores.equityScore - prevScores.equityScore))} pts.`,
    },
  ];

  // Sort by magnitude of change descending and take top 3
  const sorted = changes
    .filter((c) => Math.abs(c.delta) > 0.001)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3)
    .map((c) => ({
      ...c,
      isPositive: c.delta >= 0,
    }));

  if (sorted.length === 0) {
    return [
      {
        factor: 'Balanced Equilibrium',
        delta: 0,
        explanation: 'Metrics remained stable across all zones.',
        isPositive: true,
      },
    ];
  }

  return sorted;
}

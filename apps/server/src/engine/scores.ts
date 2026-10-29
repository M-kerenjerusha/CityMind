import { CityScores, CityState, PrioritySliders, ZoneId } from '@citymind/shared';

export const ZONE_IDS: ZoneId[] = ['industrial', 'residential', 'downtown', 'outskirts'];

/**
 * Clamps a number between min and max (inclusive).
 */
export function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Rounds a number to a specified number of decimal places.
 */
export function roundTo(val: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

/**
 * Calculates all headline scores from the current state and priority sliders.
 *
 * Formulas:
 * - Emissions Score = 100 - average emissions across all 4 zones
 * - Happiness Score = average happiness across all 4 zones
 * - Reliability Score = 100 - average energy load across all 4 zones
 * - Budget Score = remaining budget (capped at 100 for index normalization)
 * - Equity Score = 100 - (highest zone happiness - lowest zone happiness)
 * - Sustainability Index = weighted average using priority sliders (normalized to 100%)
 * - Resilience Score = 100 * (0.4 * lowest / baseline + 0.4 * current / baseline + 0.2 * (1 - months_to_recover / 6))
 */
export function calculateScores(state: CityState, priorities?: PrioritySliders): CityScores {
  const activePriorities = priorities || state.priorities || {
    environment: 40,
    happiness: 30,
    cost: 20,
    reliability: 10,
  };

  const zones = Object.values(state.zones);
  const zoneCount = zones.length || 1;

  const totalEmissions = zones.reduce((sum, z) => sum + z.emissions, 0);
  const totalHappiness = zones.reduce((sum, z) => sum + z.happiness, 0);
  const totalEnergyLoad = zones.reduce((sum, z) => sum + z.energy_load, 0);

  const avgEmissions = totalEmissions / zoneCount;
  const avgHappiness = totalHappiness / zoneCount;
  const avgEnergyLoad = totalEnergyLoad / zoneCount;

  const emissionsScore = clamp(roundTo(100 - avgEmissions));
  const happinessScore = clamp(roundTo(avgHappiness));
  const reliabilityScore = clamp(roundTo(100 - avgEnergyLoad));
  const budgetScore = roundTo(state.budget);

  // Equity = 100 - (highest zone happiness - lowest zone happiness)
  const happinessValues = zones.map((z) => z.happiness);
  const maxHappiness = Math.max(...happinessValues);
  const minHappiness = Math.min(...happinessValues);
  const equitySpread = maxHappiness - minHappiness;
  const equityScore = clamp(roundTo(100 - equitySpread));

  // Sustainability Index = weighted average using priority sliders
  const totalWeight =
    activePriorities.environment +
    activePriorities.happiness +
    activePriorities.cost +
    activePriorities.reliability || 100;

  // Budget is capped at 100 for the index calculation
  const normalizedBudget = clamp(state.budget, 0, 100);

  const weightedSum =
    activePriorities.environment * emissionsScore +
    activePriorities.happiness * happinessScore +
    activePriorities.cost * normalizedBudget +
    activePriorities.reliability * reliabilityScore;

  const sustainabilityIndex = clamp(roundTo(weightedSum / totalWeight));

  // Resilience score calculation
  const baseline = state.baselineSustainabilityIndex || 60;
  const lowest = state.lowestSustainabilityIndex || sustainabilityIndex;
  const current = sustainabilityIndex;
  const monthsToRecover = Math.min(6, Math.max(0, state.monthsSinceCrisis || 0));

  // Resilience Score formula: 100 * (0.4 * lowest / baseline + 0.4 * current / baseline + 0.2 * (1 - months_to_recover / 6))
  const term1 = 0.4 * Math.min(1.2, lowest / baseline);
  const term2 = 0.4 * Math.min(1.2, current / baseline);
  const term3 = 0.2 * Math.max(0, 1 - monthsToRecover / 6);
  const resilienceScore = clamp(roundTo(100 * (term1 + term2 + term3)));

  return {
    emissionsScore,
    happinessScore,
    reliabilityScore,
    budgetScore,
    equityScore,
    sustainabilityIndex,
    resilienceScore,
  };
}

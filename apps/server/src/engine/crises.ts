import {
  ActiveCrisis,
  CityScores,
  CityState,
  CrisisDefinition,
  CrisisId,
  CrisisSeverity,
  ZoneId,
} from '@citymind/shared';
import crisesData from '../data/crises.json';
import { calculateScores, clamp, roundTo } from './scores';

export const CRISES_CATALOG: CrisisDefinition[] = crisesData as any;

export interface CrisisExecutionResult {
  previousState: CityState;
  newState: CityState;
  previousScores: CityScores;
  newScores: CityScores;
  mitigationPercent: number;
  mitigationMessage: string;
  crisis: CrisisDefinition;
  severity: CrisisSeverity;
}

export function getCrisisById(id: CrisisId): CrisisDefinition | undefined {
  return CRISES_CATALOG.find((c) => c.id === id);
}

export function getSeverityMultiplier(severity: CrisisSeverity): number {
  switch (severity) {
    case 'mild':
      return 0.5;
    case 'severe':
      return 1.0;
    case 'catastrophic':
      return 1.5;
    default:
      return 1.0;
  }
}

/**
 * Triggers a crisis on a city state, factoring in mitigation from earlier choices.
 */
export function applyCrisis(
  state: CityState,
  crisisId: CrisisId,
  severity: CrisisSeverity = 'severe'
): CrisisExecutionResult {
  const crisis = getCrisisById(crisisId);
  if (!crisis) {
    throw new Error(`Unknown crisis: ${crisisId}`);
  }

  const previousScores = calculateScores(state);
  const nextState: CityState = JSON.parse(JSON.stringify(state));
  const mult = getSeverityMultiplier(severity);

  let mitigationPercent = 0;
  const mitigationDetails: string[] = [];

  // Check earlier investments for mitigations
  if (crisisId === 'heatwave') {
    const batteryCount = nextState.actionsTaken.battery || 0;
    const solarCount = nextState.actionsTaken.solar || 0;

    let heatwaveMitigation = 0;
    if (batteryCount > 0) {
      heatwaveMitigation += 0.40;
      mitigationDetails.push('Battery Storage (-40%)');
    }
    if (solarCount > 0) {
      heatwaveMitigation += 0.15;
      mitigationDetails.push('Rooftop Solar (-15%)');
    }

    mitigationPercent = Math.min(0.8, heatwaveMitigation);
    const effectiveDamageMultiplier = (1 - mitigationPercent) * mult;

    // Apply Heatwave effects
    // Energy load +25, happiness -12 in all zones; extra 6 budget cost
    for (const zId of Object.keys(nextState.zones) as ZoneId[]) {
      const z = nextState.zones[zId];
      z.energy_load = clamp(roundTo(z.energy_load + 25 * effectiveDamageMultiplier));
      z.happiness = clamp(roundTo(z.happiness - 12 * mult));
    }
    nextState.budget = clamp(roundTo(nextState.budget - 6 * mult), 0, 999);
  } else if (crisisId === 'factory_closing') {
    // Factory Closing: Industrial emissions -20 but happiness -15 in Industrial and Residential; budget -8
    const indZone = nextState.zones.industrial;
    const resZone = nextState.zones.residential;

    if (indZone) {
      indZone.emissions = clamp(roundTo(indZone.emissions - 20 * mult));
      indZone.happiness = clamp(roundTo(indZone.happiness - 15 * mult));
    }
    if (resZone) {
      resZone.happiness = clamp(roundTo(resZone.happiness - 15 * mult));
    }
    nextState.budget = clamp(roundTo(nextState.budget - 8 * mult), 0, 999);
  } else if (crisisId === 'transport_strike') {
    // Transport Strike: traffic +25 in all zones, happiness -10
    const busesCount = nextState.actionsTaken.buses || 0;
    if (busesCount > 0) {
      mitigationPercent = 0.30;
      mitigationDetails.push('Municipal Buses Network (-30%)');
    }

    const effectiveTrafficMultiplier = (1 - mitigationPercent) * mult;

    for (const zId of Object.keys(nextState.zones) as ZoneId[]) {
      const z = nextState.zones[zId];
      z.traffic = clamp(roundTo(z.traffic + 25 * effectiveTrafficMultiplier));
      z.happiness = clamp(roundTo(z.happiness - 10 * mult));
    }
  }

  const roundedMitigationPct = Math.round(mitigationPercent * 100);
  const mitigationMessage =
    roundedMitigationPct > 0
      ? `Your earlier investment in ${mitigationDetails.join(' & ')} reduced the damage by ${roundedMitigationPct}%!`
      : 'No earlier protective mitigation was active. Full crisis damage was sustained.';

  // Record active crisis & damage tracker
  const rawDamagePoints = 30 * mult;
  nextState.crisisDamageRemaining = roundTo(rawDamagePoints * (1 - mitigationPercent));
  nextState.monthsSinceCrisis = 0;

  const activeCrisisRecord: ActiveCrisis = {
    id: crisisId,
    name: crisis.name,
    severity,
    startedMonth: nextState.month,
    mitigationPercent: roundedMitigationPct,
    mitigationMessage,
  };
  nextState.activeCrisis = activeCrisisRecord;

  // Re-calculate scores
  const newScores = calculateScores(nextState);
  if (newScores.sustainabilityIndex < nextState.lowestSustainabilityIndex) {
    nextState.lowestSustainabilityIndex = newScores.sustainabilityIndex;
  }

  // Record history entry
  nextState.history.push({
    month: nextState.month,
    crisisEvent: `${crisis.name} (${severity.toUpperCase()})`,
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
    mitigationPercent: roundedMitigationPct,
    mitigationMessage,
    crisis,
    severity,
  };
}

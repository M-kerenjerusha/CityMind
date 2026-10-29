import { CityState, GreenCreditLog, ZoneId } from '@citymind/shared';
import { roundTo } from './scores';

export const MAX_CREDITS_PER_ZONE_PER_MONTH = 15;

export interface GreenCreditCalculationResult {
  totalCreditsAwarded: number;
  logs: GreenCreditLog[];
}

/**
 * Calculates fair Green Credits earned between previousState and newState.
 *
 * Rules:
 * 1. Credits are granted ONLY when a zone's measured emissions or traffic has ACTUALLY dropped.
 * 2. Capped at 15 credits per zone per month to prevent exploit farming.
 * 3. Proportional to physical metric improvement (1 credit per 1 point drop).
 * 4. Transparent audit log recorded.
 */
export function awardGreenCredits(
  prevState: CityState,
  newState: CityState
): GreenCreditCalculationResult {
  const logs: GreenCreditLog[] = [];
  let totalCreditsAwarded = 0;

  const zoneIds: ZoneId[] = ['industrial', 'residential', 'downtown', 'outskirts'];

  for (const zId of zoneIds) {
    const prevZone = prevState.zones[zId];
    const newZone = newState.zones[zId];

    if (!prevZone || !newZone) continue;

    let zoneAwarded = 0;

    // Check emissions drop
    const emissionsDrop = roundTo(prevZone.emissions - newZone.emissions);
    if (emissionsDrop > 0) {
      const eligibleCredits = Math.round(emissionsDrop);
      const remainingZoneCap = MAX_CREDITS_PER_ZONE_PER_MONTH - zoneAwarded;
      const awarded = Math.min(eligibleCredits, remainingZoneCap);

      if (awarded > 0) {
        zoneAwarded += awarded;
        totalCreditsAwarded += awarded;
        logs.push({
          id: `gc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          month: newState.month,
          zoneId: zId,
          metric: 'emissions',
          dropAmount: emissionsDrop,
          creditsAwarded: awarded,
          reason: `Verified ${emissionsDrop} pt reduction in ${prevZone.name} emissions.`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Check traffic drop
    const trafficDrop = roundTo(prevZone.traffic - newZone.traffic);
    if (trafficDrop > 0 && zoneAwarded < MAX_CREDITS_PER_ZONE_PER_MONTH) {
      const eligibleCredits = Math.round(trafficDrop);
      const remainingZoneCap = MAX_CREDITS_PER_ZONE_PER_MONTH - zoneAwarded;
      const awarded = Math.min(eligibleCredits, remainingZoneCap);

      if (awarded > 0) {
        zoneAwarded += awarded;
        totalCreditsAwarded += awarded;
        logs.push({
          id: `gc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          month: newState.month,
          zoneId: zId,
          metric: 'traffic',
          dropAmount: trafficDrop,
          creditsAwarded: awarded,
          reason: `Verified ${trafficDrop} pt reduction in ${prevZone.name} traffic.`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  return {
    totalCreditsAwarded,
    logs,
  };
}

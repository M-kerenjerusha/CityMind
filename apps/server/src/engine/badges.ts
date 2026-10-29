import { Badge, CityScores, CityState } from '@citymind/shared';

export const ALL_BADGES: Omit<Badge, 'unlocked' | 'unlockedAtMonth'>[] = [
  {
    id: 'green_mayor',
    name: 'Green Mayor',
    description: 'Achieve an overall city Emissions Score above 70.',
    icon: 'leaf',
  },
  {
    id: 'crisis_survivor',
    name: 'Crisis Survivor',
    description: 'Survive a surprise crisis and maintain city Resilience above 70.',
    icon: 'shield-check',
  },
  {
    id: 'fair_leader',
    name: 'Fair Leader',
    description: 'Bridge regional inequality to reach an Equity Score above 75.',
    icon: 'scale',
  },
  {
    id: 'budget_master',
    name: 'Budget Master',
    description: 'Preserve at least $20 in the treasury through Month 5 or beyond.',
    icon: 'coins',
  },
];

/**
 * Checks which badges are unlocked based on city state and headline scores.
 */
export function checkAndAwardBadges(state: CityState, scores: CityScores): Badge[] {
  const result: Badge[] = [];

  for (const b of ALL_BADGES) {
    let isUnlocked = false;

    if (b.id === 'green_mayor') {
      isUnlocked = scores.emissionsScore > 70;
    } else if (b.id === 'crisis_survivor') {
      const hasExperiencedCrisis =
        state.activeCrisis !== null || state.history.some((h) => h.crisisEvent !== undefined);
      isUnlocked = hasExperiencedCrisis && scores.resilienceScore > 70;
    } else if (b.id === 'fair_leader') {
      isUnlocked = scores.equityScore > 75;
    } else if (b.id === 'budget_master') {
      isUnlocked = state.month >= 5 && state.budget > 20;
    }

    result.push({
      ...b,
      unlocked: isUnlocked,
      unlockedAtMonth: isUnlocked ? state.month : undefined,
    });
  }

  return result;
}

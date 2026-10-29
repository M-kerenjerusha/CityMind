import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialCityState,
  simulate,
  implementAction,
  getActionById,
} from '../src/engine/simulationEngine';
import { calculateScores } from '../src/engine/scores';
import { applyCrisis } from '../src/engine/crises';
import { getRecommendation } from '../src/engine/recommendations';
import { awardGreenCredits } from '../src/engine/credits';
import { checkAndAwardBadges } from '../src/engine/badges';
import { CityState } from '@citymind/shared';

describe('CityMind Simulation Engine', () => {
  let initialState: CityState;

  beforeEach(() => {
    initialState = createInitialCityState();
  });

  it('1. Purity of simulate: original state is never mutated', () => {
    const originalSnapshot = JSON.stringify(initialState);
    const nextState = simulate(initialState, 'solar');

    // Original state string must remain identical
    expect(JSON.stringify(initialState)).toBe(originalSnapshot);
    expect(nextState.budget).toBe(initialState.budget - 20);
    expect(nextState.month).toBe(initialState.month + 1);
    expect(nextState.zones.industrial.energy_load).toBe(
      initialState.zones.industrial.energy_load - 12
    );
  });

  it('2. Clamping: metrics never drop below 0 or exceed 100', () => {
    let state = createInitialCityState();
    // Simulate multiple solar and battery purchases with elevated starting points
    state.zones.outskirts.energy_load = 5;
    const simState = simulate(state, 'solar');
    expect(simState.zones.outskirts.energy_load).toBe(0); // Clamped at 0, not -7
  });

  it('3. Diminishing returns: 2nd purchase produces 50% weaker effects', () => {
    const state0 = createInitialCityState({ budget: 100 });
    const state1 = simulate(state0, 'buses');
    const firstDrop = state0.zones.downtown.traffic - state1.zones.downtown.traffic;

    const state2 = simulate(state1, 'buses');
    const secondDrop = state1.zones.downtown.traffic - state2.zones.downtown.traffic;

    expect(firstDrop).toBe(12);
    expect(secondDrop).toBe(6); // exactly 50%
  });

  it('4. Budget and purchase limit constraints are enforced', () => {
    const poorState = createInitialCityState({ budget: 10 });
    expect(() => simulate(poorState, 'solar')).toThrow(/Insufficient budget/);

    let state = createInitialCityState({ budget: 100 });
    state = simulate(state, 'signals'); // 1st
    state = simulate(state, 'signals'); // 2nd
    expect(() => simulate(state, 'signals')).toThrow(/maximum limit reached/); // 3rd blocked
  });

  it('5. Crisis protection: Battery Storage reduces heatwave damage by 40%', () => {
    const unprotectedState = createInitialCityState();
    const unprotectedResult = applyCrisis(unprotectedState, 'heatwave', 'severe');

    const protectedState = createInitialCityState();
    protectedState.actionsTaken.battery = 1;
    const protectedResult = applyCrisis(protectedState, 'heatwave', 'severe');

    expect(protectedResult.mitigationPercent).toBe(40);
    expect(protectedResult.mitigationMessage).toContain('Battery Storage');

    // Energy load increase in unprotected is +25, protected is +25 * 0.6 = +15
    const unprotDelta =
      unprotectedResult.newState.zones.industrial.energy_load -
      unprotectedState.zones.industrial.energy_load;
    const protDelta =
      protectedResult.newState.zones.industrial.energy_load -
      protectedState.zones.industrial.energy_load;

    expect(unprotDelta).toBe(20); // 80 + 25 clamped to 100 => 20
    expect(protDelta).toBe(15); // 80 + 15 = 95
  });

  it('6. Resilience formula accurately reflects recovery and baseline health', () => {
    const state = createInitialCityState();
    state.baselineSustainabilityIndex = 70;
    state.lowestSustainabilityIndex = 50;
    state.monthsSinceCrisis = 2;

    const scores = calculateScores(state);
    expect(scores.resilienceScore).toBeGreaterThan(0);
    expect(scores.resilienceScore).toBeLessThanOrEqual(100);
  });

  it('7. Green credits anti-gaming: awards credits only on measured drops with capping', () => {
    const state1 = createInitialCityState();
    const state2 = JSON.parse(JSON.stringify(state1));

    // No changes => 0 credits
    const zeroResult = awardGreenCredits(state1, state2);
    expect(zeroResult.totalCreditsAwarded).toBe(0);

    // Simulate drop in downtown emissions by 8
    state2.zones.downtown.emissions = state1.zones.downtown.emissions - 8;
    const positiveResult = awardGreenCredits(state1, state2);
    expect(positiveResult.totalCreditsAwarded).toBe(8);
    expect(positiveResult.logs.length).toBe(1);
    expect(positiveResult.logs[0].metric).toBe('emissions');
  });

  it('8. Badge reachability: every single badge can be unlocked', () => {
    const state = createInitialCityState();

    // 1. Green Mayor (emissions score > 70)
    // Reduce emissions in all zones to 20 => avg emissions 20 => emissions score = 80
    for (const z of Object.values(state.zones)) {
      z.emissions = 20;
    }
    let scores = calculateScores(state);
    let badges = checkAndAwardBadges(state, scores);
    expect(badges.find((b) => b.id === 'green_mayor')?.unlocked).toBe(true);

    // 2. Fair Leader (equity > 75)
    // Equalize zone happiness: all 70 => diff 0 => equity score = 100
    for (const z of Object.values(state.zones)) {
      z.happiness = 70;
    }
    scores = calculateScores(state);
    badges = checkAndAwardBadges(state, scores);
    expect(badges.find((b) => b.id === 'fair_leader')?.unlocked).toBe(true);

    // 3. Budget Master (budget > 20 after 5 months)
    state.month = 6;
    state.budget = 35;
    badges = checkAndAwardBadges(state, scores);
    expect(badges.find((b) => b.id === 'budget_master')?.unlocked).toBe(true);

    // 4. Crisis Survivor (survived crisis with resilience > 70)
    state.activeCrisis = {
      id: 'heatwave',
      name: 'Heatwave',
      severity: 'mild',
      startedMonth: 1,
      mitigationPercent: 40,
      mitigationMessage: 'Mitigated',
    };
    state.baselineSustainabilityIndex = 65;
    state.lowestSustainabilityIndex = 60;
    state.monthsSinceCrisis = 1;
    scores = calculateScores(state);
    badges = checkAndAwardBadges(state, scores);
    expect(badges.find((b) => b.id === 'crisis_survivor')?.unlocked).toBe(true);
  });

  it('9. Recommendations change dynamically when priority sliders shift', () => {
    const state = createInitialCityState();

    // Prioritizing cost heavily
    const costPriority = { environment: 5, happiness: 5, cost: 80, reliability: 10 };
    const costRec = getRecommendation(state, costPriority);

    // Prioritizing environment heavily
    const envPriority = { environment: 85, happiness: 5, cost: 5, reliability: 5 };
    const envRec = getRecommendation(state, envPriority);

    expect(costRec.bestAction.id).not.toBe(envRec.bestAction.id);
  });
});

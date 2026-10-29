import {
  ActionDefinition,
  ActionId,
  CityState,
  PrioritySliders,
  RecommendationItem,
  RecommendationResult,
} from '@citymind/shared';
import { ACTIONS_CATALOG, simulate } from './simulationEngine';
import { calculateScores, roundTo } from './scores';

/**
 * Generates an objective recommendation based on the current city state and priority sliders.
 */
export function getRecommendation(
  state: CityState,
  priorities?: PrioritySliders
): RecommendationResult {
  const activePriorities = priorities || state.priorities || {
    environment: 40,
    happiness: 30,
    cost: 20,
    reliability: 10,
  };

  const totalWeight =
    activePriorities.environment +
    activePriorities.happiness +
    activePriorities.cost +
    activePriorities.reliability || 100;

  const currentScores = calculateScores(state, activePriorities);

  const scoredActions: Array<{
    action: ActionDefinition;
    score: number;
    affordable: boolean;
    timesPurchased: number;
    resultingIndex: number;
    pros: string;
    cons: string;
  }> = [];

  for (const action of ACTIONS_CATALOG) {
    const timesPurchased = state.actionsTaken[action.id] || 0;
    const affordable = state.budget >= action.cost && timesPurchased < 2;

    let simScores = currentScores;
    let resultingIndex = currentScores.sustainabilityIndex;

    try {
      if (timesPurchased < 2) {
        // Temporarily lend budget if testing hypothetical metric return of unaffordable action
        const testState: CityState = JSON.parse(JSON.stringify(state));
        if (testState.budget < action.cost) {
          testState.budget = action.cost;
        }
        const simState = simulate(testState, action.id);
        // Correct budget back
        simState.budget = state.budget - action.cost;
        simScores = calculateScores(simState, activePriorities);
        resultingIndex = simScores.sustainabilityIndex;
      }
    } catch {
      resultingIndex = currentScores.sustainabilityIndex - 10;
    }

    // Base recommendation score = sum(weight x resulting metric)
    const normalizedBudget = Math.max(0, Math.min(100, state.budget - action.cost));
    let rawScore =
      (activePriorities.environment * simScores.emissionsScore +
        activePriorities.happiness * simScores.happinessScore +
        activePriorities.cost * normalizedBudget +
        activePriorities.reliability * simScores.reliabilityScore) /
      totalWeight;

    // Rule: minus 20 if cost > budget
    if (action.cost > state.budget) {
      rawScore -= 20;
    }

    // Heavy penalty if already maxed out
    if (timesPurchased >= 2) {
      rawScore -= 40;
    }

    // Determine pros and cons
    let pros = '';
    let cons = '';
    if (action.id === 'solar') {
      pros = 'Drastic city-wide energy load (-12) and emissions reduction (-10).';
      cons = 'Substantial capital outlay ($20).';
    } else if (action.id === 'battery') {
      pros = 'Provides vital heatwave resilience buffering (-40% damage) and grid load cuts.';
      cons = 'Moderate initial cost ($18) with no direct citizen happiness lift.';
    } else if (action.id === 'buses') {
      pros = 'Cuts congestion and pollution in Downtown & Residential while boosting morale (+5).';
      cons = 'Ongoing transit allocation of $15.';
    } else if (action.id === 'signals') {
      pros = 'Extremely cost-effective ($8) targeted congestion relief in Downtown.';
      cons = 'Localized downtown impact without broader grid or waste benefits.';
    } else if (action.id === 'recycling') {
      pros = 'Affordable ($10) circular waste initiative that cuts emissions and lifts spirits (+4).';
      cons = 'Does not directly address vehicular traffic or electrical grid peaks.';
    } else if (action.id === 'road') {
      pros = 'High instantaneous Downtown traffic reduction (-15).';
      cons = 'Very expensive ($25), increases long-term emissions (+6) and upsets residents.';
    } else if (action.id === 'congestion') {
      pros = 'Cheap ($5) and immediate Downtown traffic deterrent (-10).';
      cons = 'Sharp trade-off: reduces residential satisfaction (-8) due to tolls.';
    }

    scoredActions.push({
      action,
      score: roundTo(rawScore),
      affordable,
      timesPurchased,
      resultingIndex,
      pros,
      cons,
    });
  }

  // Sort by score descending
  scoredActions.sort((a, b) => b.score - a.score);

  const best = scoredActions[0];
  const runnerUp = scoredActions.length > 1 ? scoredActions[1] : null;

  // Generate plain-language reason for best action
  const reason = generateBestActionReason(best, activePriorities);

  // Generate one sentence on why runner-up lost
  const runnerUpReason = runnerUp
    ? generateRunnerUpReason(runnerUp, best, activePriorities)
    : 'No alternative action available.';

  const rankedActions: RecommendationItem[] = scoredActions.map((s) => ({
    action: s.action,
    score: s.score,
    affordable: s.affordable,
    timesPurchased: s.timesPurchased,
    pros: s.pros,
    cons: s.cons,
  }));

  return {
    bestAction: best.action,
    bestScore: best.score,
    reason,
    runnerUpAction: runnerUp ? runnerUp.action : null,
    runnerUpReason,
    rankedActions,
  };
}

function generateBestActionReason(
  best: { action: ActionDefinition; score: number; affordable: boolean },
  weights: PrioritySliders
): string {
  const highestWeight = Object.entries(weights).sort((a, b) => b[1] - a[1])[0][0];

  let focusArea = 'balanced sustainability';
  if (highestWeight === 'environment') focusArea = 'environmental emissions reduction';
  else if (highestWeight === 'happiness') focusArea = 'resident quality of life';
  else if (highestWeight === 'cost') focusArea = 'cost efficiency and treasury preservation';
  else if (highestWeight === 'reliability') focusArea = 'power grid stability';

  return `"${best.action.name}" is currently your highest-scoring option (Score: ${best.score}). It aligns with your council's emphasis on ${focusArea} while maintaining fiscal affordability.`;
}

function generateRunnerUpReason(
  runnerUp: { action: ActionDefinition; score: number; affordable: boolean },
  best: { action: ActionDefinition; score: number },
  weights: PrioritySliders
): string {
  const scoreDiff = roundTo(best.score - runnerUp.score);
  return `Runner-up "${runnerUp.action.name}" trailed by ${scoreDiff} points due to ${
    !runnerUp.affordable
      ? 'insufficient treasury funds'
      : 'higher relative costs and lower priority weighting under your current sliders'
  }.`;
}

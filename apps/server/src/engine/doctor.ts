import { ActionDefinition, CityState, DoctorRecoveryPlan } from '@citymind/shared';
import { ACTIONS_CATALOG, getActionById } from './simulationEngine';

export function generateDoctorRecoveryPlan(state: CityState): DoctorRecoveryPlan {
  const activeCrisis = state.activeCrisis;

  if (activeCrisis?.id === 'heatwave') {
    return {
      crisisName: activeCrisis.name,
      severity: activeCrisis.severity,
      estimatedRecoveryMonths: 3,
      naturalRecoveryRatePercent: 15,
      steps: [
        {
          stepNumber: 1,
          action: getActionById('solar')!,
          rationale: 'Rapidly deploys distributed PV generation to shave extreme cooling peaks across all zones.',
          acceleratedRecoveryBonus: '+20% faster grid load stabilization',
        },
        {
          stepNumber: 2,
          action: getActionById('battery')!,
          rationale: 'Installs energy buffering to eliminate blackouts and protect commercial and residential stability.',
          acceleratedRecoveryBonus: '+25% grid resilience restoration',
        },
        {
          stepNumber: 3,
          action: getActionById('recycling')!,
          rationale: 'Boosts neighborhood morale (+4 happiness) and reduces ambient heat from waste composting.',
          acceleratedRecoveryBonus: '+15% community morale rebound',
        },
      ],
    };
  }

  if (activeCrisis?.id === 'transport_strike') {
    return {
      crisisName: activeCrisis.name,
      severity: activeCrisis.severity,
      estimatedRecoveryMonths: 2,
      naturalRecoveryRatePercent: 15,
      steps: [
        {
          stepNumber: 1,
          action: getActionById('buses')!,
          rationale: 'Deploys rapid emergency municipal shuttle fleets to move stranded commuters.',
          acceleratedRecoveryBonus: '+30% congestion recovery speed',
        },
        {
          stepNumber: 2,
          action: getActionById('signals')!,
          rationale: 'Optimizes traffic signal timing loops to prioritize high-capacity emergency routes.',
          acceleratedRecoveryBonus: '+20% bottleneck clearance',
        },
        {
          stepNumber: 3,
          action: getActionById('congestion')!,
          rationale: 'Deters single-occupancy vehicles from blocking vital downtown arteries.',
          acceleratedRecoveryBonus: '+15% flow restoration',
        },
      ],
    };
  }

  if (activeCrisis?.id === 'factory_closing') {
    return {
      crisisName: activeCrisis.name,
      severity: activeCrisis.severity,
      estimatedRecoveryMonths: 4,
      naturalRecoveryRatePercent: 15,
      steps: [
        {
          stepNumber: 1,
          action: getActionById('recycling')!,
          rationale: 'Creates immediate circular-economy jobs in the industrial zone and lifts local morale.',
          acceleratedRecoveryBonus: '+25% employment transition speed',
        },
        {
          stepNumber: 2,
          action: getActionById('buses')!,
          rationale: 'Connects residential workers to growing downtown employment centers.',
          acceleratedRecoveryBonus: '+20% regional mobility support',
        },
        {
          stepNumber: 3,
          action: getActionById('solar')!,
          rationale: 'Repurposes brownfield industrial roofs with clean energy generation assets.',
          acceleratedRecoveryBonus: '+15% economic renewal',
        },
      ],
    };
  }

  // Preventive Resilience Fortification Plan
  return {
    crisisName: 'Calm Weather (Preventive Resilience Fortification)',
    severity: 'mild',
    estimatedRecoveryMonths: 1,
    naturalRecoveryRatePercent: 15,
    steps: [
      {
        stepNumber: 1,
        action: getActionById('solar')!,
        rationale: 'Builds renewable capacity to inoculate the city against summer heat surges.',
        acceleratedRecoveryBonus: '+15% pre-emptive shock protection',
      },
      {
        stepNumber: 2,
        action: getActionById('battery')!,
        rationale: 'Establishes emergency reserves before unexpected outages strike.',
        acceleratedRecoveryBonus: '+40% heatwave buffer locked in',
      },
      {
        stepNumber: 3,
        action: getActionById('buses')!,
        rationale: 'Cultivates resilient public transit usage habits across residential corridors.',
        acceleratedRecoveryBonus: '+30% transit strike resilience locked in',
      },
    ],
  };
}

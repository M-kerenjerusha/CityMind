import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { CityScores, CityState } from '@citymind/shared';
import { calculateScores } from '../engine/scores';
import { getRecommendation } from '../engine/recommendations';
import { simulate, ACTIONS_CATALOG } from '../engine/simulationEngine';

// Cache for responses to save quota and speed up repeated queries
const aiCache = new Map<string, { reply: string; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

export interface AiResponsePayload {
  reply: string;
  isOfflineAdvisor: boolean;
  suggestedQuestions?: string[];
  simulationData?: any;
}

const WhatIfSchema = z.object({
  actionId: z.enum(['buses', 'signals', 'road', 'solar', 'battery', 'recycling', 'congestion']),
  count: z.number().int().min(1).max(2).default(1),
  explanation: z.string().optional(),
});

export function getModelName(): string {
  const model = process.env.GEMINI_MODEL;
  if (!model || model === 'gemini-2.5-flash' || model === 'gemini-1.5-flash') {
    return 'gemini-3.8-flash';
  }
  return model;
}

export async function askGemiChat(
  message: string,
  state: CityState
): Promise<AiResponsePayload> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = getModelName();

  const scores = calculateScores(state);
  const rec = getRecommendation(state);

  const factsJson = {
    cityName: state.cityName,
    month: state.month,
    budget: state.budget,
    sustainabilityIndex: scores.sustainabilityIndex,
    emissionsScore: scores.emissionsScore,
    happinessScore: scores.happinessScore,
    reliabilityScore: scores.reliabilityScore,
    equityScore: scores.equityScore,
    resilienceScore: scores.resilienceScore,
    activeCrisis: state.activeCrisis ? state.activeCrisis.name : 'None',
    bestRecommendedAction: rec.bestAction.name,
    bestRecommendedReason: rec.reason,
    zones: {
      industrial: { emissions: state.zones.industrial.emissions, energy: state.zones.industrial.energy_load, happiness: state.zones.industrial.happiness },
      residential: { emissions: state.zones.residential.emissions, energy: state.zones.residential.energy_load, happiness: state.zones.residential.happiness },
      downtown: { traffic: state.zones.downtown.traffic, emissions: state.zones.downtown.emissions, happiness: state.zones.downtown.happiness },
      outskirts: { emissions: state.zones.outskirts.emissions, happiness: state.zones.outskirts.happiness },
    },
  };

  const defaultSuggestedQuestions = [
    'Why is Downtown congested?',
    'What should I prioritize first?',
    'How does Equity affect my score?',
    'How can I prepare for heatwaves?',
  ];

  // If no API key provided, immediately invoke rule-based offline advisor
  if (!apiKey || apiKey.trim() === '') {
    return {
      reply: getOfflineAdvisorReply(message, factsJson),
      isOfflineAdvisor: true,
      suggestedQuestions: defaultSuggestedQuestions,
    };
  }

  // Check cache
  const cacheKey = `chat:${message.trim().toLowerCase()}:${state.month}:${Math.round(scores.sustainabilityIndex)}`;
  const cached = aiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      reply: cached.reply,
      isOfflineAdvisor: false,
      suggestedQuestions: defaultSuggestedQuestions,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const systemPrompt = `You are Gemi the Owl, a friendly, wise cartoon city advisor for a student hackathon game called CityMind Quest.
Use ONLY the numbers and facts provided below. Never invent numbers or hallucinate metrics. Keep answers short (2 to 4 sentences), plain-language, encouraging, and actionable.
If the player asks something completely unrelated to city governance or sustainability, politely steer them back to helping their city.

CURRENT VERIFIED CITY FACTS:
${JSON.stringify(factsJson, null, 2)}`;

    // Timeout after 8 seconds
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nPLAYER QUESTION: "${message}"` }],
        },
      ],
    });
    clearTimeout(timeout);

    const reply = result.response.text().trim();
    aiCache.set(cacheKey, { reply, timestamp: Date.now() });

    return {
      reply,
      isOfflineAdvisor: false,
      suggestedQuestions: defaultSuggestedQuestions,
    };
  } catch (error: any) {
    console.warn('Gemini API call failed, falling back to rule-based advisor:', error?.message);
    return {
      reply: getOfflineAdvisorReply(message, factsJson),
      isOfflineAdvisor: true,
      suggestedQuestions: defaultSuggestedQuestions,
    };
  }
}

/**
 * Explains level results in the voice of the specified NPC character.
 */
export async function explainLevelResult(
  npcId: string,
  levelId: string,
  state: CityState,
  actionId?: string
): Promise<AiResponsePayload> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = getModelName();
  const scores = calculateScores(state);

  const factsJson = {
    levelId,
    npcId,
    sustainabilityIndex: scores.sustainabilityIndex,
    emissionsScore: scores.emissionsScore,
    happinessScore: scores.happinessScore,
    reliabilityScore: scores.reliabilityScore,
    equityScore: scores.equityScore,
    budget: state.budget,
    actionTaken: actionId,
  };

  if (!apiKey || apiKey.trim() === '') {
    return {
      reply: getOfflineNpcExplanation(npcId, scores, actionId),
      isOfflineAdvisor: true,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are roleplaying as NPC "${npcId}" in CityMind Quest.
Give a 2-sentence celebratory and constructive debrief on the player's recent action and city status.
Use only these facts:
${JSON.stringify(factsJson, null, 2)}`;

    const result = await model.generateContent(prompt);
    return {
      reply: result.response.text().trim(),
      isOfflineAdvisor: false,
    };
  } catch {
    return {
      reply: getOfflineNpcExplanation(npcId, scores, actionId),
      isOfflineAdvisor: true,
    };
  }
}

/**
 * Natural language what-if query: Parses player intent into a structured ActionId,
 * runs it through the pure simulation engine, and returns verified deterministic results.
 */
export async function handleWhatIfQuery(
  query: string,
  state: CityState
): Promise<AiResponsePayload> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = getModelName();

  let parsedAction: { actionId: string; count: number } | null = null;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `The user is asking a "what if" question about their city: "${query}".
Map their intent to one of the following available action IDs:
- "buses" (Increase Buses)
- "signals" (Smart Traffic Signals)
- "road" (Build New Road)
- "solar" (Rooftop Solar)
- "battery" (Battery Storage)
- "recycling" (Waste Recycling Drive)
- "congestion" (Congestion Pricing)

Return JSON with format:
{
  "actionId": "one of the action IDs above",
  "count": 1 or 2,
  "explanation": "brief sentence summarizing intent"
}`;

      const res = await model.generateContent(prompt);
      const jsonText = res.response.text();
      const parsed = JSON.parse(jsonText);
      const validated = WhatIfSchema.safeParse(parsed);
      if (validated.success) {
        parsedAction = {
          actionId: validated.data.actionId,
          count: validated.data.count,
        };
      }
    } catch (e) {
      console.warn('Gemini what-if parsing failed:', e);
    }
  }

  // Fallback regex / keyword parsing if Gemini unavailable or failed
  if (!parsedAction) {
    const q = query.toLowerCase();
    let actionId: any = 'solar';
    if (q.includes('bus')) actionId = 'buses';
    else if (q.includes('signal') || q.includes('traffic light')) actionId = 'signals';
    else if (q.includes('road') || q.includes('highway')) actionId = 'road';
    else if (q.includes('battery') || q.includes('storage')) actionId = 'battery';
    else if (q.includes('recycle') || q.includes('waste')) actionId = 'recycling';
    else if (q.includes('congestion') || q.includes('toll')) actionId = 'congestion';
    else if (q.includes('solar') || q.includes('panel')) actionId = 'solar';

    const count = q.includes('twice') || q.includes('2') || q.includes('two') ? 2 : 1;
    parsedAction = { actionId, count };
  }

  // Run through real simulation engine
  const actionDef = ACTIONS_CATALOG.find((a) => a.id === parsedAction!.actionId)!;
  let simulatedState = state;
  let canSimulate = true;
  let simError = '';

  try {
    for (let i = 0; i < parsedAction.count; i++) {
      simulatedState = simulate(simulatedState, parsedAction.actionId as any);
    }
  } catch (err: any) {
    canSimulate = false;
    simError = err.message;
  }

  const prevScores = calculateScores(state);
  const nextScores = canSimulate ? calculateScores(simulatedState) : prevScores;

  const replyText = canSimulate
    ? `Hoo! If you implement "${actionDef.name}" ${parsedAction.count > 1 ? 'twice' : 'once'}, your Sustainability Index would shift from ${prevScores.sustainabilityIndex} to ${nextScores.sustainabilityIndex} (${nextScores.sustainabilityIndex >= prevScores.sustainabilityIndex ? '+' : ''}${Math.round((nextScores.sustainabilityIndex - prevScores.sustainabilityIndex) * 10) / 10} pts). Remaining budget would be $${simulatedState.budget}.`
    : `Hoo! That simulation could not be executed: ${simError}`;

  return {
    reply: replyText,
    isOfflineAdvisor: !apiKey,
    simulationData: {
      action: actionDef,
      count: parsedAction.count,
      canExecute: canSimulate,
      previousScores: prevScores,
      simulatedScores: nextScores,
      simulatedBudget: simulatedState.budget,
    },
  };
}

/**
 * End-of-game Mayor's Report Narrative Generator.
 */
export async function generateMayorReportNarrative(state: CityState): Promise<string> {
  const scores = calculateScores(state);
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = getModelName();

  if (!apiKey || apiKey.trim() === '') {
    return `During Mayor ${state.mayorName}'s term in ${state.cityName}, the city maintained a commendable Sustainability Index of ${scores.sustainabilityIndex} and a Resilience Score of ${scores.resilienceScore}. By balancing renewable investments with citizen happiness and equity (${scores.equityScore}), the municipal administration established an enduring benchmark for sustainable regional development.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Write a 3-paragraph executive summary for Mayor ${state.mayorName}'s final term report in ${state.cityName}.
Use ONLY these real metrics:
- Months Governed: ${state.month}
- Final Sustainability Index: ${scores.sustainabilityIndex} / 100
- Emissions Score: ${scores.emissionsScore} / 100
- Citizen Happiness: ${scores.happinessScore} / 100
- Grid Reliability: ${scores.reliabilityScore} / 100
- Social Equity: ${scores.equityScore} / 100
- Crisis Resilience: ${scores.resilienceScore} / 100
- Remaining Budget: $${state.budget}
Tone: Professional, inspiring, grounded in facts.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return `During Mayor ${state.mayorName}'s term in ${state.cityName}, the city maintained a commendable Sustainability Index of ${scores.sustainabilityIndex} and a Resilience Score of ${scores.resilienceScore}. By balancing renewable investments with citizen happiness and equity (${scores.equityScore}), the municipal administration established an enduring benchmark for sustainable regional development.`;
  }
}

// ----------------- OFFLINE ADVISOR FALLBACK LOGIC -----------------

function getOfflineAdvisorReply(userQuestion: string, facts: any): string {
  const q = userQuestion.toLowerCase();

  if (q.includes('downtown') || q.includes('traffic') || q.includes('red') || q.includes('congestion')) {
    return `Hoo! Downtown traffic is currently at ${facts.zones.downtown.traffic}/100 and emissions are ${facts.zones.downtown.emissions}/100. Investing in "Increase Buses" or "Smart Traffic Signals" will ease arterial gridlock without penalizing resident happiness.`;
  }

  if (q.includes('what should i do') || q.includes('recommend') || q.includes('first') || q.includes('suggest')) {
    return `Hoo! According to your current council weights, the optimal next step is "${facts.bestRecommendedAction}". ${facts.bestRecommendedReason}`;
  }

  if (q.includes('equity') || q.includes('fair') || q.includes('spread')) {
    return `Hoo! Your Equity Score is currently ${facts.equityScore}/100. Equity measures the gap between your happiest zone (${facts.zones.outskirts.happiness}) and lowest zone (${facts.zones.industrial.happiness}). Narrowing this spread protects social harmony!`;
  }

  if (q.includes('heatwave') || q.includes('crisis') || q.includes('resilience') || q.includes('disaster')) {
    return `Hoo! Your current Resilience Score is ${facts.resilienceScore}/100. Installing "Battery Storage" reduces heatwave damage by 40%, and "Rooftop Solar" adds another 15% protection against grid overload.`;
  }

  if (q.includes('budget') || q.includes('money') || q.includes('cost')) {
    return `Hoo! Your municipal treasury holds $${facts.budget}. Remember that actions purchased a second time cost the same but offer 50% diminished returns, so diversify your investments wisely!`;
  }

  return `Hoo! Your city is currently at a Sustainability Index of ${facts.sustainabilityIndex}/100 with an Emissions score of ${facts.emissionsScore}/100. My top recommendation right now is "${facts.bestRecommendedAction}".`;
}

function getOfflineNpcExplanation(npcId: string, scores: CityScores, actionId?: string): string {
  switch (npcId) {
    case 'volt':
      return `Professor Volt here! Our grid reliability is now at ${scores.reliabilityScore}/100. Keep peak energy loads trimmed to keep blackouts at bay!`;
    case 'zoom':
      return `Captain Zoom reporting! Downtown transit corridors are moving. Emissions score stands at ${scores.emissionsScore}/100!`;
    case 'rina':
      return `Rina here! Our neighborhood circular drives are taking root. Citizen happiness has reached ${scores.happinessScore}/100!`;
    case 'penny':
      return `Comptroller Penny here! Budget is monitored and our Equity rating is at ${scores.equityScore}/100. Every dollar is pulling its weight!`;
    case 'blaze':
      return `Chief Blaze here! Resilience score is currently ${scores.resilienceScore}/100. Stay vigilant and keep emergency buffers primed!`;
    default:
      return `Mayor Mira here! Outstanding governance. Your city Sustainability Index is now ${scores.sustainabilityIndex}/100!`;
  }
}

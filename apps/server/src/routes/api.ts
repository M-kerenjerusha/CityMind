import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  createInitialCityState,
  implementAction,
  simulate,
  ACTIONS_CATALOG,
  getActionById,
} from '../engine/simulationEngine';
import { calculateScores } from '../engine/scores';
import { getRecommendation } from '../engine/recommendations';
import { applyCrisis } from '../engine/crises';
import { generateDoctorRecoveryPlan } from '../engine/doctor';
import { checkAndAwardBadges, ALL_BADGES } from '../engine/badges';
import { fetchCityRealData } from '../services/realData';
import {
  askGemiChat,
  explainLevelResult,
  handleWhatIfQuery,
  generateMayorReportNarrative,
} from '../services/gemini';
import { getDatabase, resetDatabase } from '../db/database';
import levelsData from '../data/levels.json';
import { ActionId, CityState, CrisisId, CrisisSeverity } from '@citymind/shared';

export const apiRouter = Router();

// In-memory active session cache backed by SQLite
let activeSessionState: CityState = createInitialCityState();

// Helper to save state to SQLite
function persistSession(state: CityState, sessionId = 'default-player') {
  try {
    const db = getDatabase();
    const scores = calculateScores(state);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT OR REPLACE INTO sessions (id, player_name, city_name, avatar, difficulty, state_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      state.mayorName,
      state.cityName,
      state.mayorAvatar,
      state.difficulty,
      JSON.stringify(state),
      now,
      now
    );

    // Save unlocked levels
    for (const [lvlId, completed] of Object.entries(state.levelCompleted)) {
      const stars = state.stars[lvlId] || 0;
      db.prepare(`
        INSERT OR REPLACE INTO unlocked_levels (session_id, level_id, completed, stars, unlocked_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(sessionId, lvlId, completed ? 1 : 0, stars, now);
    }

    // Save leaderboard entry
    const totalStars = Object.values(state.stars).reduce((sum, s) => sum + s, 0);
    db.prepare(`
      INSERT OR REPLACE INTO leaderboard (id, player_name, city_name, avatar, difficulty, sustainability_index, resilience_score, stars_total, credits, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      state.mayorName,
      state.cityName,
      state.mayorAvatar,
      state.difficulty,
      scores.sustainabilityIndex,
      scores.resilienceScore,
      totalStars,
      state.credits,
      now
    );
  } catch (err) {
    console.warn('Error persisting session to SQLite:', err);
  }
}

// ---------------------------------------------
// 1. GET /api/city
// ---------------------------------------------
apiRouter.get('/city', (req: Request, res: Response) => {
  const scores = calculateScores(activeSessionState);
  const badges = checkAndAwardBadges(activeSessionState, scores);
  res.json({
    ok: true,
    data: {
      state: activeSessionState,
      scores,
      badges,
      actionsCatalog: ACTIONS_CATALOG,
    },
  });
});

// ---------------------------------------------
// 2. POST /api/preview
// ---------------------------------------------
const ActionPayloadSchema = z.object({
  actionId: z.enum(['buses', 'signals', 'road', 'solar', 'battery', 'recycling', 'congestion']),
});

apiRouter.post('/preview', (req: Request, res: Response) => {
  const parseResult = ActionPayloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ ok: false, error: 'Invalid action ID supplied.' });
  }

  const { actionId } = parseResult.data;
  try {
    const previousScores = calculateScores(activeSessionState);
    // PURE SIMULATION: NEVER CHANGES STORED STATE
    const previewState = simulate(activeSessionState, actionId);
    const previewScores = calculateScores(previewState);

    return res.json({
      ok: true,
      data: {
        actionId,
        previousState: activeSessionState,
        previewState,
        previousScores,
        previewScores,
        delta: {
          sustainabilityIndex: Math.round((previewScores.sustainabilityIndex - previousScores.sustainabilityIndex) * 10) / 10,
          emissionsScore: Math.round((previewScores.emissionsScore - previousScores.emissionsScore) * 10) / 10,
          happinessScore: Math.round((previewScores.happinessScore - previousScores.happinessScore) * 10) / 10,
          reliabilityScore: Math.round((previewScores.reliabilityScore - previousScores.reliabilityScore) * 10) / 10,
          budget: Math.round((previewScores.budgetScore - previousScores.budgetScore) * 10) / 10,
        },
      },
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, error: error.message || 'Simulation failed.' });
  }
});

// ---------------------------------------------
// 3. POST /api/implement
// ---------------------------------------------
apiRouter.post('/implement', (req: Request, res: Response) => {
  const parseResult = ActionPayloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ ok: false, error: 'Invalid action ID supplied.' });
  }

  const { actionId } = parseResult.data;
  try {
    const result = implementAction(activeSessionState, actionId);
    activeSessionState = result.newState;

    // Persist green credit logs in SQLite
    const db = getDatabase();
    for (const log of result.creditsLog) {
      try {
        db.prepare(`
          INSERT OR REPLACE INTO green_credits_log (id, session_id, month, zone_id, metric, drop_amount, credits_awarded, reason, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          log.id,
          'default-player',
          log.month,
          log.zoneId,
          log.metric,
          log.dropAmount,
          log.creditsAwarded,
          log.reason,
          log.timestamp
        );
      } catch (e) {
        console.warn('Could not insert credit log:', e);
      }
    }

    persistSession(activeSessionState);

    return res.json({
      ok: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, error: error.message || 'Implementation failed.' });
  }
});

// ---------------------------------------------
// 4. GET /api/recommendation
// ---------------------------------------------
apiRouter.get('/recommendation', (req: Request, res: Response) => {
  const envWeight = req.query.env ? Number(req.query.env) : activeSessionState.priorities.environment;
  const hapWeight = req.query.hap ? Number(req.query.hap) : activeSessionState.priorities.happiness;
  const costWeight = req.query.cost ? Number(req.query.cost) : activeSessionState.priorities.cost;
  const relWeight = req.query.rel ? Number(req.query.rel) : activeSessionState.priorities.reliability;

  const priorities = {
    environment: envWeight,
    happiness: hapWeight,
    cost: costWeight,
    reliability: relWeight,
  };

  const rec = getRecommendation(activeSessionState, priorities);
  res.json({ ok: true, data: rec });
});

// ---------------------------------------------
// 5. POST /api/priorities
// ---------------------------------------------
const PrioritiesSchema = z.object({
  environment: z.number().min(0).max(100),
  happiness: z.number().min(0).max(100),
  cost: z.number().min(0).max(100),
  reliability: z.number().min(0).max(100),
});

apiRouter.post('/priorities', (req: Request, res: Response) => {
  const parsed = PrioritiesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Invalid priority sliders.' });
  }

  activeSessionState.priorities = parsed.data;
  persistSession(activeSessionState);

  const scores = calculateScores(activeSessionState);
  const rec = getRecommendation(activeSessionState);

  res.json({
    ok: true,
    data: {
      priorities: activeSessionState.priorities,
      scores,
      recommendation: rec,
    },
  });
});

// ---------------------------------------------
// 6. POST /api/crisis (Chaos Panel)
// ---------------------------------------------
const CrisisSchema = z.object({
  crisisId: z.enum(['heatwave', 'factory_closing', 'transport_strike']),
  severity: z.enum(['mild', 'severe', 'catastrophic']).default('severe'),
});

apiRouter.post('/crisis', (req: Request, res: Response) => {
  const parsed = CrisisSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Invalid crisis parameters.' });
  }

  try {
    const result = applyCrisis(activeSessionState, parsed.data.crisisId, parsed.data.severity);
    activeSessionState = result.newState;
    persistSession(activeSessionState);

    return res.json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({ ok: false, error: err.message || 'Crisis execution failed.' });
  }
});

// ---------------------------------------------
// 7. GET /api/doctor
// ---------------------------------------------
apiRouter.get('/doctor', (req: Request, res: Response) => {
  const plan = generateDoctorRecoveryPlan(activeSessionState);
  res.json({ ok: true, data: plan });
});

// ---------------------------------------------
// 8. GET /api/explain
// ---------------------------------------------
apiRouter.get('/explain', (req: Request, res: Response) => {
  const scores = calculateScores(activeSessionState);
  const history = activeSessionState.history;
  const lastHistory = history.length > 1 ? history[history.length - 2] : null;

  const topContributors = [
    {
      factor: 'Power & Grid Stress',
      delta: Math.round(100 - scores.reliabilityScore),
      explanation: `City energy load is averaging ${Math.round(100 - scores.reliabilityScore)}% across all sectors.`,
      isPositive: scores.reliabilityScore > 60,
    },
    {
      factor: 'Air Quality & Emissions',
      delta: Math.round(100 - scores.emissionsScore),
      explanation: `Emissions index is ${scores.emissionsScore}/100. Industrial smokestacks remain the primary driver.`,
      isPositive: scores.emissionsScore > 60,
    },
    {
      factor: 'Regional Equity',
      delta: Math.round(scores.equityScore),
      explanation: `Happiness parity across zones stands at ${scores.equityScore}/100.`,
      isPositive: scores.equityScore > 70,
    },
  ];

  res.json({
    ok: true,
    data: {
      scores,
      topContributors,
    },
  });
});

// ---------------------------------------------
// 9. GET /api/credits
// ---------------------------------------------
apiRouter.get('/credits', (req: Request, res: Response) => {
  const db = getDatabase();
  let logs: any[] = [];
  try {
    logs = db
      .prepare('SELECT * FROM green_credits_log WHERE session_id = ? ORDER BY created_at DESC LIMIT 50')
      .all('default-player');
  } catch (e) {
    console.warn('Credits query error:', e);
  }

  res.json({
    ok: true,
    data: {
      creditsBalance: activeSessionState.credits,
      rules: [
        'Credits are granted ONLY when a zone’s measured emissions or traffic has actually dropped.',
        'Repeatedly clicking actions without net improvements yields zero credits.',
        'Awards are capped at a maximum of 15 credits per zone per month to prevent exploitation.',
        'Credits are distributed transparently across Industrial, Residential, Downtown, and Outskirts.',
      ],
      auditLog: logs,
    },
  });
});

// ---------------------------------------------
// 10. POST /api/difficulty
// ---------------------------------------------
const DifficultySchema = z.object({
  difficulty: z.enum(['easy', 'normal', 'hard']),
});

apiRouter.post('/difficulty', (req: Request, res: Response) => {
  const parsed = DifficultySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Invalid difficulty choice.' });
  }

  const diff = parsed.data.difficulty;
  const newBudget = diff === 'easy' ? 120 : diff === 'hard' ? 70 : 100;
  activeSessionState.difficulty = diff;
  activeSessionState.budget = newBudget;
  activeSessionState.initialBudget = newBudget;

  persistSession(activeSessionState);
  res.json({
    ok: true,
    data: {
      difficulty: diff,
      budget: newBudget,
      state: activeSessionState,
    },
  });
});

// ---------------------------------------------
// 11. POST /api/reset
// ---------------------------------------------
apiRouter.post('/reset', (req: Request, res: Response) => {
  activeSessionState = createInitialCityState();
  persistSession(activeSessionState);
  res.json({
    ok: true,
    data: {
      message: 'City state successfully reset to initial conditions.',
      state: activeSessionState,
      scores: calculateScores(activeSessionState),
    },
  });
});

// ---------------------------------------------
// 12. POST /api/session (Create or restore session)
// ---------------------------------------------
const SessionCreateSchema = z.object({
  playerName: z.string().min(1).max(30).default('Alex'),
  cityName: z.string().min(1).max(40).default('Neo Metropolis'),
  avatar: z.string().default('mira'),
  difficulty: z.enum(['easy', 'normal', 'hard']).default('normal'),
  realDataPayload: z.any().optional(),
});

apiRouter.post('/session', (req: Request, res: Response) => {
  const parsed = SessionCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Invalid session creation data.' });
  }

  const { playerName, cityName, avatar, difficulty, realDataPayload } = parsed.data;
  const initialBudget = difficulty === 'easy' ? 120 : difficulty === 'hard' ? 70 : 100;

  activeSessionState = createInitialCityState({
    mayorName: playerName,
    cityName,
    mayorAvatar: avatar,
    difficulty,
    budget: initialBudget,
    initialBudget,
    isRealData: !!realDataPayload,
    realDataSource: realDataPayload?.source,
    realDataTimestamp: realDataPayload?.timestamp,
    ...(realDataPayload?.zones ? { zones: realDataPayload.zones } : {}),
  });

  persistSession(activeSessionState);

  res.json({
    ok: true,
    data: {
      state: activeSessionState,
      scores: calculateScores(activeSessionState),
    },
  });
});

// ---------------------------------------------
// 13. GET /api/leaderboard
// ---------------------------------------------
apiRouter.get('/leaderboard', (req: Request, res: Response) => {
  const db = getDatabase();
  try {
    const rows = db
      .prepare('SELECT * FROM leaderboard ORDER BY sustainability_index DESC, stars_total DESC LIMIT 20')
      .all();
    return res.json({ ok: true, data: rows });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// ---------------------------------------------
// 14. GET /api/levels & POST /api/level/complete
// ---------------------------------------------
apiRouter.get('/levels', (req: Request, res: Response) => {
  const levelsWithStatus = (levelsData as any[]).map((lvl) => {
    // Determine unlocked status based on progression order
    let isUnlocked = lvl.unlockedByDefault;
    if (!isUnlocked) {
      if (lvl.id === 'transit') isUnlocked = activeSessionState.levelCompleted.power === true;
      else if (lvl.id === 'waste') isUnlocked = activeSessionState.levelCompleted.transit === true;
      else if (lvl.id === 'hall') isUnlocked = activeSessionState.levelCompleted.waste === true;
      else if (lvl.id === 'crisis') isUnlocked = activeSessionState.levelCompleted.hall === true;
    }

    return {
      ...lvl,
      unlocked: isUnlocked,
      completed: !!activeSessionState.levelCompleted[lvl.id],
      stars: activeSessionState.stars[lvl.id] || 0,
    };
  });

  res.json({ ok: true, data: levelsWithStatus });
});

const CompleteLevelSchema = z.object({
  levelId: z.string(),
  stars: z.number().int().min(1).max(3).default(3),
});

apiRouter.post('/levels/complete', (req: Request, res: Response) => {
  const parsed = CompleteLevelSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Invalid level completion payload.' });
  }

  const { levelId, stars } = parsed.data;
  activeSessionState.levelCompleted[levelId] = true;
  activeSessionState.stars[levelId] = Math.max(activeSessionState.stars[levelId] || 0, stars);
  activeSessionState.xp += stars * 100;

  persistSession(activeSessionState);

  res.json({
    ok: true,
    data: {
      levelId,
      stars,
      levelCompleted: activeSessionState.levelCompleted,
      allStars: activeSessionState.stars,
      xp: activeSessionState.xp,
    },
  });
});

// ---------------------------------------------
// 15. GET /api/realdata?city=...
// ---------------------------------------------
apiRouter.get('/realdata', async (req: Request, res: Response) => {
  const cityQuery = req.query.city ? String(req.query.city) : 'Sample City';
  try {
    const payload = await fetchCityRealData(cityQuery);
    return res.json({ ok: true, data: payload });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// ---------------------------------------------
// 16. AI Endpoints: Chat, Explain, WhatIf, Report
// ---------------------------------------------
const ChatSchema = z.object({
  message: z.string().min(1).max(400),
});

apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  const parsed = ChatSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Message must be between 1 and 400 characters.' });
  }

  const result = await askGemiChat(parsed.data.message, activeSessionState);
  res.json({ ok: true, data: result });
});

const ExplainSchema = z.object({
  npcId: z.string().default('mira'),
  levelId: z.string().default('power'),
  actionId: z.string().optional(),
});

apiRouter.post('/ai/explain', async (req: Request, res: Response) => {
  const parsed = ExplainSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Invalid explain request parameters.' });
  }

  const result = await explainLevelResult(
    parsed.data.npcId,
    parsed.data.levelId,
    activeSessionState,
    parsed.data.actionId
  );
  res.json({ ok: true, data: result });
});

const WhatIfPayloadSchema = z.object({
  query: z.string().min(1).max(300),
});

apiRouter.post('/ai/whatif', async (req: Request, res: Response) => {
  const parsed = WhatIfPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: 'Query must be between 1 and 300 characters.' });
  }

  const result = await handleWhatIfQuery(parsed.data.query, activeSessionState);
  res.json({ ok: true, data: result });
});

apiRouter.get('/report', async (req: Request, res: Response) => {
  const narrative = await generateMayorReportNarrative(activeSessionState);
  const scores = calculateScores(activeSessionState);
  const badges = checkAndAwardBadges(activeSessionState, scores);

  res.json({
    ok: true,
    data: {
      state: activeSessionState,
      scores,
      badges,
      narrative,
      history: activeSessionState.history,
    },
  });
});

// ---------------------------------------------
// 17. GET /api/health
// ---------------------------------------------
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    ok: true,
    data: {
      status: 'healthy',
      version: '1.0.0',
      geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
      geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      database: 'node:sqlite (operational)',
      uptimeSeconds: process.uptime(),
    },
  });
});

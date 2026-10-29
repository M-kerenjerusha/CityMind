import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('CityMind Server API Smoke Tests', () => {
  it('GET /api/health returns healthy and configuration info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('GET /api/city returns default initial city and scores', async () => {
    const res = await request(app).get('/api/city');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.state.cityName).toBeDefined();
    expect(res.body.data.scores.sustainabilityIndex).toBeGreaterThan(0);
  });

  it('POST /api/preview does NOT modify the stored city state', async () => {
    const cityBefore = await request(app).get('/api/city');
    const monthBefore = cityBefore.body.data.state.month;
    const budgetBefore = cityBefore.body.data.state.budget;

    const previewRes = await request(app)
      .post('/api/preview')
      .send({ actionId: 'buses' });

    expect(previewRes.status).toBe(200);
    expect(previewRes.body.ok).toBe(true);
    expect(previewRes.body.data.previewState.budget).toBe(budgetBefore - 15);

    // Verify stored state did not change
    const cityAfter = await request(app).get('/api/city');
    expect(cityAfter.body.data.state.month).toBe(monthBefore);
    expect(cityAfter.body.data.state.budget).toBe(budgetBefore);
  });

  it('POST /api/implement applies the action and advances state', async () => {
    const cityBefore = await request(app).get('/api/city');
    const monthBefore = cityBefore.body.data.state.month;
    const budgetBefore = cityBefore.body.data.state.budget;

    const implRes = await request(app)
      .post('/api/implement')
      .send({ actionId: 'signals' });

    expect(implRes.status).toBe(200);
    expect(implRes.body.ok).toBe(true);

    const cityAfter = await request(app).get('/api/city');
    expect(cityAfter.body.data.state.month).toBe(monthBefore + 1);
    expect(cityAfter.body.data.state.budget).toBe(budgetBefore - 8);
  });

  it('POST /api/crisis executes heatwave crisis and reports mitigations', async () => {
    const crisisRes = await request(app)
      .post('/api/crisis')
      .send({ crisisId: 'heatwave', severity: 'mild' });

    expect(crisisRes.status).toBe(200);
    expect(crisisRes.body.ok).toBe(true);
    expect(crisisRes.body.data.crisis.name).toBe('Extreme Heatwave');
  });

  it('POST /api/ai/whatif executes natural language query through simulator', async () => {
    const whatifRes = await request(app)
      .post('/api/ai/whatif')
      .send({ query: 'What if I build solar once?' });

    expect(whatifRes.status).toBe(200);
    expect(whatifRes.body.ok).toBe(true);
    expect(whatifRes.body.data.reply.length).toBeGreaterThan(10);
    expect(whatifRes.body.data.simulationData).toBeDefined();
  }, 15000);

  it('GET /api/realdata returns data with fallback resilience', async () => {
    const res = await request(app).get('/api/realdata?city=London');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.temperatureC).toBeDefined();
    expect(res.body.data.zones).toBeDefined();
  });
});

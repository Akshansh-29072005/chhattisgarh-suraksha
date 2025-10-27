import request from 'supertest';
import express from 'express';
import mlRoutes from '../routes/ml.routes.js';

const app = express();
app.use(express.json());
app.use('/api/ml', mlRoutes);

describe('ML API Endpoints', () => {
  test('GET /api/ml/hotspots returns predictions', async () => {
    const res = await request(app).get('/api/ml/hotspots');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/ml/forecast returns 24h forecast', async () => {
    const res = await request(app).get('/api/ml/forecast');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('predictions');
    expect(res.body.data.predictions.length).toBe(4);
  });

  test('GET /api/ml/risk-assessment returns health risk', async () => {
    const res = await request(app).get('/api/ml/risk-assessment');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('overallRisk');
    expect(res.body.data).toHaveProperty('healthScore');
  });

  test('GET /api/ml/patterns returns pattern analysis', async () => {
    const res = await request(app).get('/api/ml/patterns');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

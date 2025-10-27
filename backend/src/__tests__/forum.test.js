import request from 'supertest';
import express from 'express';
import forumRoutes from '../routes/forum.routes.js';

const app = express();
app.use(express.json());
app.use('/api/forum', forumRoutes);

describe('Forum API Endpoints', () => {
  test('GET /api/forum/topics returns topic list', async () => {
    const res = await request(app).get('/api/forum/topics');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('topics');
  });

  test('GET /api/forum/topics with filters', async () => {
    const res = await request(app).get('/api/forum/topics?category=air_quality&sort=popular');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

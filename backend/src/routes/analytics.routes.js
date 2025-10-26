import express from 'express';
import { getMetricsSummary, getTrends, getInsights } from '../controllers/analytics.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateAnalyticsQuery } from '../middleware/validation.js';
import { cacheAnalyticsInsights } from '../middleware/cache.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authMiddleware);

// Get aggregated metrics summary
router.get('/metrics-summary', validateAnalyticsQuery, getMetricsSummary);

// Get trends for specific metric
router.get('/trends', getTrends);

// Get insights and patterns
router.get('/insights', cacheAnalyticsInsights, getInsights);

export default router;

import express from 'express';
import {
  getCurrentMetrics,
  getActiveAlerts,
  getMetricsHistory,
  forceMetricsUpdate
} from '../controllers/metrics.controller.js';
import { authenticateToken as authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get current environmental metrics (requires auth)
router.get('/current', authenticate, getCurrentMetrics);

// Get active alerts (requires auth)
router.get('/alerts', authenticate, getActiveAlerts);

// Get historical metrics (requires auth)
router.get('/history', authenticate, getMetricsHistory);

// Force update metrics (admin only)
router.post('/update', authenticate, forceMetricsUpdate);

export default router;
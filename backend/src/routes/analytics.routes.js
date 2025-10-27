import express from 'express';
import {
  getEnvironmentalData,
  getStatistics,
  exportData
} from '../controllers/analytics.controller.js';

const router = express.Router();

// Get paginated environmental data for data table (public)
router.get('/data', getEnvironmentalData);

// Get statistical summary (public)
router.get('/statistics', getStatistics);

// Export environmental data (public but could add rate limiting)
router.post('/export', exportData);

export default router;

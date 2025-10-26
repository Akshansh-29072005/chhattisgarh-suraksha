import express from 'express';
import { getReports, getSensors, searchLocations } from '../controllers/map.controller.js';
import { validateMapBounds, validateLocationSearch } from '../middleware/validation.js';
import { cacheMapData } from '../middleware/cache.js';

const router = express.Router();

// Public routes (no auth required for map viewing)
router.get('/reports', validateMapBounds, cacheMapData, getReports);
router.get('/sensors', validateMapBounds, getSensors);
router.post('/search', validateLocationSearch, searchLocations);

export default router;

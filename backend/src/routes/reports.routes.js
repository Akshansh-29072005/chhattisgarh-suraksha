import express from 'express';
import { submitReport, getAllReports } from '../controllers/reports.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Require authentication for submitting reports so we can credit user activity and points
router.post('/submit', authenticateToken, submitReport);
router.get('/all', getAllReports);

export default router;

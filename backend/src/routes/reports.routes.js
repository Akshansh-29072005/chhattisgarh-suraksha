import express from 'express';
import { submitReport, getAllReports } from '../controllers/reports.controller.js';

const router = express.Router();

router.post('/submit', submitReport);
router.get('/all', getAllReports);

export default router;

import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/users.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, getUserProfile);

// Update user profile
router.put('/profile', authenticateToken, updateUserProfile);

export default router;
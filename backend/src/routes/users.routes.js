import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    getUserPreferences,
    updateUserPreferences,
    getNotificationSettings,
    updateNotificationSettings,
    getUserImpactStats
} from '../controllers/users.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
    validateUpdateProfile,
    validateUpdatePreferences,
    validateUpdateNotificationSettings
} from '../middleware/validation.js';
import { cacheUserPreferences, cacheUserImpact } from '../middleware/cache.js';

const router = express.Router();

// User profile routes
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, validateUpdateProfile, updateUserProfile);

// User preferences routes
router.get('/preferences', authenticateToken, cacheUserPreferences, getUserPreferences);
router.put('/preferences', authenticateToken, validateUpdatePreferences, updateUserPreferences);

// Notification settings routes
router.get('/notification-settings', authenticateToken, getNotificationSettings);
router.put('/notification-settings', authenticateToken, validateUpdateNotificationSettings, updateNotificationSettings);

// User impact statistics
router.get('/impact-stats', authenticateToken, cacheUserImpact, getUserImpactStats);

export default router;
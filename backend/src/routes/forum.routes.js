import express from 'express';
import { createTopic, getTopics, getTopic, createPost, vote, deleteTopic } from '../controllers/forum.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateCreateTopic, validateCreatePost, validateVote } from '../middleware/validation.js';
import { forumPostRateLimiter } from '../middleware/rate-limiter.js';
import { cacheForumTopics } from '../middleware/cache.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/topics', cacheForumTopics, getTopics);
router.get('/topics/:topicId', getTopic);

// Protected routes (auth required)
router.post('/topics', authMiddleware, forumPostRateLimiter, validateCreateTopic, createTopic);
router.post('/topics/:topicId/posts', authMiddleware, forumPostRateLimiter, validateCreatePost, createPost);
router.post('/vote', authMiddleware, validateVote, vote);
router.delete('/topics/:topicId', authMiddleware, deleteTopic);

export default router;

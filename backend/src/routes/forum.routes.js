import express from 'express';
import {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  voteTopic,
  addReply,
  getReplies
} from '../controllers/forum.controller.js';
import { authenticateToken as authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all topics (public - but will check for optional auth)
router.get('/topics', getAllTopics);

// Get single topic by ID (public)
router.get('/topics/:id', getTopicById);

// Create new topic (requires auth)
router.post('/topics', authenticate, createTopic);

// Update topic (requires auth, owner only)
router.put('/topics/:id', authenticate, updateTopic);

// Delete topic (requires auth, owner only)
router.delete('/topics/:id', authenticate, deleteTopic);

// Vote on topic (requires auth)
router.post('/topics/:id/vote', authenticate, voteTopic);

// Add reply to topic (requires auth)
router.post('/topics/:id/replies', authenticate, addReply);

// Get replies for a topic (public)
router.get('/topics/:id/replies', getReplies);

export default router;

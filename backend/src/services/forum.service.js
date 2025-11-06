import Forum from '../models/forum.js';
import ForumValidator from '../models/forum-validator.js';
import { ForumError } from '../models/forum-errors.js';

class ForumService {
  // Initialize forum tables
  static async init() {
    await Forum.createTables();
  }

  // Get all forum topics with optional filters
  static async getAllTopics(filters) {
    try {
      return await Forum.getAllTopics(filters);
    } catch (error) {
      throw new ForumError('Error fetching topics: ' + error.message);
    }
  }

  // Get single topic by ID
  static async getTopicById(id) {
    try {
      const topic = await Forum.getTopicById(id);
      if (!topic) {
        throw new ForumError('Topic not found');
      }
      return topic;
    } catch (error) {
      throw new ForumError('Error fetching topic: ' + error.message);
    }
  }

  // Create a new forum topic
  static async createTopic(userId, data) {
    try {
      return await Forum.createTopic(data, userId);
    } catch (error) {
      throw new ForumError('Error creating topic: ' + error.message);
    }
  }

  // Update existing forum topic
  static async updateTopic(id, userId, updates) {
    try {
      const topic = await Forum.updateTopic(id, updates, userId);
      if (!topic) {
        throw new ForumError('Topic not found or access denied');
      }
      return topic;
    } catch (error) {
      throw new ForumError('Error updating topic: ' + error.message);
    }
  }

  // Delete forum topic
  static async deleteTopic(id, userId) {
    try {
      const topic = await Forum.deleteTopic(id, userId);
      if (!topic) {
        throw new ForumError('Topic not found or access denied');
      }
      return topic;
    } catch (error) {
      throw new ForumError('Error deleting topic: ' + error.message);
    }
  }

  // Add reply to topic
  static async addReply(topicId, userId, content) {
    try {
      return await Forum.addReply(topicId, content, userId);
    } catch (error) {
      throw new ForumError('Error adding reply: ' + error.message);
    }
  }

  // Get all replies for a topic
  static async getTopicReplies(topicId, limit, offset) {
    try {
      return await Forum.getTopicReplies(topicId, limit, offset);
    } catch (error) {
      throw new ForumError('Error fetching replies: ' + error.message);
    }
  }

  // Vote on a topic
  static async voteTopic(topicId, userId, voteType) {
    try {
      return await Forum.voteTopic(topicId, userId, voteType);
    } catch (error) {
      throw new ForumError('Error voting on topic: ' + error.message);
    }
  }

  // Get forum statistics
  static async getForumStats() {
    try {
      return await Forum.getForumStats();
    } catch (error) {
      throw new ForumError('Error fetching forum stats: ' + error.message);
    }
  }

  // Get top contributors
  static async getTopContributors(limit) {
    try {
      return await Forum.getTopContributors(limit);
    } catch (error) {
      throw new ForumError('Error fetching top contributors: ' + error.message);
    }
  }

  // Update user's online status
  static async updateUserOnlineStatus(userId, username) {
    try {
      await Forum.updateUserOnlineStatus(userId, username);
    } catch (error) {
      throw new ForumError('Error updating online status: ' + error.message);
    }
  }
}

export default ForumService;
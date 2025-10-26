import { query } from '../config/database.js';
import { deleteCache, deleteCachePattern } from '../config/redis.js';
import logger from '../utils/logger.js';

// Create new forum topic
export const createTopic = async (req, res, next) => {
  try {
    const { title, category, content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const result = await query(
      `INSERT INTO forum_topics (user_id, title, category, content, last_activity_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [userId, title, category, content]
    );

    const topic = result.rows[0];

    // Get user info
    const userResult = await query(
      'SELECT id, full_name FROM users WHERE id = $1',
      [userId]
    );

    const topicWithUser = {
      ...topic,
      author: userResult.rows[0],
      vote_count: 0
    };

    // Invalidate forum topics cache
    await deleteCachePattern('cache:forum:topics:*');

    logger.info('Forum topic created', { topicId: topic.id, userId });
    res.status(201).json(topicWithUser);
  } catch (error) {
    logger.error('Error creating forum topic:', error);
    next(error);
  }
};

// Get all forum topics with pagination
export const getTopics = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 20, sortBy = 'recent' } = req.query;
    const offset = (page - 1) * limit;

    // Build query based on filters
    let whereClause = '';
    const queryParams = [];

    if (category && category !== 'all') {
      whereClause = 'WHERE t.category = $1';
      queryParams.push(category);
    }

    // Determine sort order
    let orderBy = 't.last_activity_at DESC';
    if (sortBy === 'popular') {
      orderBy = 't.views_count DESC';
    } else if (sortBy === 'mostReplied') {
      orderBy = 't.replies_count DESC';
    }

    // Get topics with author info and vote counts
    const topicsQuery = `
      SELECT
        t.*,
        u.id as author_id,
        u.full_name as author_name,
        COALESCE(SUM(CASE WHEN v.vote_type = 'upvote' THEN 1 WHEN v.vote_type = 'downvote' THEN -1 ELSE 0 END), 0) as vote_count
      FROM forum_topics t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN forum_votes v ON v.target_type = 'topic' AND v.target_id = t.id
      ${whereClause}
      GROUP BY t.id, u.id
      ORDER BY ${orderBy}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(parseInt(limit), parseInt(offset));
    const result = await query(topicsQuery, queryParams);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM forum_topics t ${whereClause}`;
    const countParams = category && category !== 'all' ? [category] : [];
    const countResult = await query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    const topics = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      content: row.content,
      views_count: row.views_count,
      replies_count: row.replies_count,
      last_activity_at: row.last_activity_at,
      created_at: row.created_at,
      author: {
        id: row.author_id,
        full_name: row.author_name
      },
      vote_count: parseInt(row.vote_count)
    }));

    res.json({
      topics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    logger.error('Error fetching forum topics:', error);
    next(error);
  }
};

// Get single topic with all posts
export const getTopic = async (req, res, next) => {
  try {
    const { topicId } = req.params;

    // Get topic details
    const topicResult = await query(
      `SELECT
        t.*,
        u.id as author_id,
        u.full_name as author_name,
        COALESCE(SUM(CASE WHEN v.vote_type = 'upvote' THEN 1 WHEN v.vote_type = 'downvote' THEN -1 ELSE 0 END), 0) as vote_count
       FROM forum_topics t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN forum_votes v ON v.target_type = 'topic' AND v.target_id = t.id
       WHERE t.id = $1
       GROUP BY t.id, u.id`,
      [topicId]
    );

    if (topicResult.rows.length === 0) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const topicData = topicResult.rows[0];

    // Increment view count
    await query(
      'UPDATE forum_topics SET views_count = views_count + 1 WHERE id = $1',
      [topicId]
    );

    // Get all posts for this topic
    const postsResult = await query(
      `SELECT
        p.*,
        u.id as author_id,
        u.full_name as author_name,
        COALESCE(SUM(CASE WHEN v.vote_type = 'upvote' THEN 1 WHEN v.vote_type = 'downvote' THEN -1 ELSE 0 END), 0) as vote_count
       FROM forum_posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN forum_votes v ON v.target_type = 'post' AND v.target_id = p.id
       WHERE p.topic_id = $1
       GROUP BY p.id, u.id
       ORDER BY p.created_at ASC`,
      [topicId]
    );

    const topic = {
      id: topicData.id,
      title: topicData.title,
      category: topicData.category,
      content: topicData.content,
      views_count: topicData.views_count + 1, // Include the increment
      replies_count: topicData.replies_count,
      last_activity_at: topicData.last_activity_at,
      created_at: topicData.created_at,
      author: {
        id: topicData.author_id,
        full_name: topicData.author_name
      },
      vote_count: parseInt(topicData.vote_count),
      posts: postsResult.rows.map(row => ({
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        author: {
          id: row.author_id,
          full_name: row.author_name
        },
        vote_count: parseInt(row.vote_count)
      }))
    };

    res.json(topic);
  } catch (error) {
    logger.error('Error fetching forum topic:', error);
    next(error);
  }
};

// Create reply to topic
export const createPost = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if topic exists
    const topicCheck = await query(
      'SELECT id FROM forum_topics WHERE id = $1',
      [topicId]
    );

    if (topicCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Create post
    const result = await query(
      `INSERT INTO forum_posts (topic_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [topicId, userId, content]
    );

    const post = result.rows[0];

    // Update topic's reply count and last activity
    await query(
      `UPDATE forum_topics
       SET replies_count = replies_count + 1, last_activity_at = NOW()
       WHERE id = $1`,
      [topicId]
    );

    // Get user info
    const userResult = await query(
      'SELECT id, full_name FROM users WHERE id = $1',
      [userId]
    );

    const postWithUser = {
      ...post,
      author: userResult.rows[0],
      vote_count: 0
    };

    // Invalidate cache
    await deleteCachePattern('cache:forum:topics:*');

    logger.info('Forum post created', { postId: post.id, topicId, userId });
    res.status(201).json(postWithUser);
  } catch (error) {
    logger.error('Error creating forum post:', error);
    next(error);
  }
};

// Vote on topic or post
export const vote = async (req, res, next) => {
  try {
    const { targetType, targetId, voteType } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Upsert vote (insert or update if exists)
    await query(
      `INSERT INTO forum_votes (user_id, target_type, target_id, vote_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, target_type, target_id)
       DO UPDATE SET vote_type = $4, created_at = NOW()`,
      [userId, targetType, targetId, voteType]
    );

    // Get updated vote count
    const voteCountResult = await query(
      `SELECT COALESCE(SUM(CASE WHEN vote_type = 'upvote' THEN 1 WHEN vote_type = 'downvote' THEN -1 ELSE 0 END), 0) as vote_count
       FROM forum_votes
       WHERE target_type = $1 AND target_id = $2`,
      [targetType, targetId]
    );

    const voteCount = parseInt(voteCountResult.rows[0].vote_count);

    logger.info('Forum vote recorded', { targetType, targetId, voteType, userId });
    res.json({ vote_count: voteCount });
  } catch (error) {
    logger.error('Error recording forum vote:', error);
    next(error);
  }
};

// Delete topic (only by author)
export const deleteTopic = async (req, res, next) => {
  try {
    const { topicId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user is the author
    const topicResult = await query(
      'SELECT user_id FROM forum_topics WHERE id = $1',
      [topicId]
    );

    if (topicResult.rows.length === 0) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (topicResult.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own topics' });
    }

    // Delete topic (posts will be deleted via CASCADE)
    await query('DELETE FROM forum_topics WHERE id = $1', [topicId]);

    // Invalidate cache
    await deleteCachePattern('cache:forum:topics:*');

    logger.info('Forum topic deleted', { topicId, userId });
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    logger.error('Error deleting forum topic:', error);
    next(error);
  }
};

export default {
  createTopic,
  getTopics,
  getTopic,
  createPost,
  vote,
  deleteTopic
};

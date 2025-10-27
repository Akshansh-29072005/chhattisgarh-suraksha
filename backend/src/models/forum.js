import { query } from '../config/database.js';

class Forum {
  // Create forum tables if they don't exist
  static async createTables() {
    // Forum topics table
    await query(`
      CREATE TABLE IF NOT EXISTS forum_topics (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        author_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_locked BOOLEAN DEFAULT FALSE,
        view_count INTEGER DEFAULT 0
      )
    `);

    // Forum replies table
    await query(`
      CREATE TABLE IF NOT EXISTS forum_replies (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Forum votes table
    await query(`
      CREATE TABLE IF NOT EXISTS forum_votes (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(topic_id, user_id)
      )
    `);

    // Forum topic tags table
    await query(`
      CREATE TABLE IF NOT EXISTS forum_topic_tags (
        topic_id INTEGER NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
        tag_name VARCHAR(50) NOT NULL,
        PRIMARY KEY (topic_id, tag_name)
      )
    `);

    console.log('✅ Forum tables created/verified');
  }

  // Get all topics with filters
  static async getAllTopics(filters = {}) {
    const {
      category = 'all',
      sort = 'recent',
      status = 'all',
      search = '',
      limit = 20,
      offset = 0
    } = filters;

    let whereClause = '';
    const params = [];
    let paramCount = 1;

    // Category filter
    if (category && category !== 'all') {
      whereClause += `ft.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    // Status filter
    if (status === 'pinned') {
      whereClause += (whereClause ? ' AND ' : '') + `ft.is_pinned = true`;
    } else if (status === 'locked') {
      whereClause += (whereClause ? ' AND ' : '') + `ft.is_locked = true`;
    }

    // Search filter
    if (search) {
      whereClause += (whereClause ? ' AND ' : '') +
        `(ft.title ILIKE $${paramCount} OR ft.content ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Sort order
    let orderBy = 'ft.updated_at DESC';
    if (sort === 'popular') orderBy = 'vote_score DESC';
    else if (sort === 'replies') orderBy = 'reply_count DESC';
    else if (sort === 'views') orderBy = 'ft.view_count DESC';
    else if (sort === 'oldest') orderBy = 'ft.created_at ASC';

    const sql = `
      SELECT
        ft.*,
        COALESCE(COUNT(DISTINCT fr.id), 0) as reply_count,
        COALESCE(COUNT(DISTINCT CASE WHEN fv.vote_type = 'up' THEN fv.id END), 0) as upvotes,
        COALESCE(COUNT(DISTINCT CASE WHEN fv.vote_type = 'down' THEN fv.id END), 0) as downvotes,
        (COALESCE(COUNT(DISTINCT CASE WHEN fv.vote_type = 'up' THEN fv.id END), 0) -
         COALESCE(COUNT(DISTINCT CASE WHEN fv.vote_type = 'down' THEN fv.id END), 0)) as vote_score,
        ARRAY_AGG(DISTINCT ftt.tag_name) FILTER (WHERE ftt.tag_name IS NOT NULL) as tags
      FROM forum_topics ft
      LEFT JOIN forum_replies fr ON ft.id = fr.topic_id
      LEFT JOIN forum_votes fv ON ft.id = fv.topic_id
      LEFT JOIN forum_topic_tags ftt ON ft.id = ftt.topic_id
      ${whereClause ? 'WHERE ' + whereClause : ''}
      GROUP BY ft.id
      ORDER BY ${orderBy}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count for pagination
    const countSql = `
      SELECT COUNT(DISTINCT ft.id) as total
      FROM forum_topics ft
      ${whereClause ? 'WHERE ' + whereClause : ''}
    `;
    const countResult = await query(countSql, params.slice(0, -2));

    return {
      topics: result.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  // Get single topic by ID
  static async getTopicById(id) {
    const result = await query(
      `SELECT
        ft.*,
        COALESCE(COUNT(DISTINCT fr.id), 0) as reply_count,
        COALESCE(COUNT(DISTINCT CASE WHEN fv.vote_type = 'up' THEN fv.id END), 0) as upvotes,
        COALESCE(COUNT(DISTINCT CASE WHEN fv.vote_type = 'down' THEN fv.id END), 0) as downvotes,
        ARRAY_AGG(DISTINCT ftt.tag_name) FILTER (WHERE ftt.tag_name IS NOT NULL) as tags
      FROM forum_topics ft
      LEFT JOIN forum_replies fr ON ft.id = fr.topic_id
      LEFT JOIN forum_votes fv ON ft.id = fv.topic_id
      LEFT JOIN forum_topic_tags ftt ON ft.id = ftt.topic_id
      WHERE ft.id = $1
      GROUP BY ft.id`,
      [id]
    );

    return result.rows[0];
  }

  // Create new topic
  static async createTopic(data, userId) {
    const { title, content, category, tags = [] } = data;

    // Insert topic
    const topicResult = await query(
      `INSERT INTO forum_topics (title, content, category, author_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, content, category, userId]
    );

    const topic = topicResult.rows[0];

    // Insert tags
    if (tags && tags.length > 0) {
      for (const tag of tags.slice(0, 5)) { // Max 5 tags
        await query(
          `INSERT INTO forum_topic_tags (topic_id, tag_name)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [topic.id, tag]
        );
      }
    }

    return topic;
  }

  // Update topic
  static async updateTopic(id, updates, userId) {
    const { title, content } = updates;

    const result = await query(
      `UPDATE forum_topics
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND author_id = $4
       RETURNING *`,
      [title, content, id, userId]
    );

    return result.rows[0];
  }

  // Delete topic
  static async deleteTopic(id, userId) {
    const result = await query(
      `DELETE FROM forum_topics
       WHERE id = $1 AND author_id = $2
       RETURNING *`,
      [id, userId]
    );

    return result.rows[0];
  }

  // Add reply to topic
  static async addReply(topicId, content, userId) {
    // Insert reply
    const replyResult = await query(
      `INSERT INTO forum_replies (topic_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [topicId, userId, content]
    );

    // Update topic updated_at
    await query(
      `UPDATE forum_topics
       SET updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [topicId]
    );

    return replyResult.rows[0];
  }

  // Get replies for a topic
  static async getTopicReplies(topicId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT fr.*
       FROM forum_replies fr
       WHERE fr.topic_id = $1
       ORDER BY fr.created_at ASC
       LIMIT $2 OFFSET $3`,
      [topicId, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM forum_replies
       WHERE topic_id = $1`,
      [topicId]
    );

    return {
      replies: result.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  // Vote on topic
  static async voteTopic(topicId, userId, voteType) {
    // Check existing vote
    const existingVote = await query(
      `SELECT * FROM forum_votes
       WHERE topic_id = $1 AND user_id = $2`,
      [topicId, userId]
    );

    if (existingVote.rows.length > 0) {
      if (existingVote.rows[0].vote_type === voteType) {
        // Same vote type - remove vote (toggle off)
        await query(
          `DELETE FROM forum_votes
           WHERE topic_id = $1 AND user_id = $2`,
          [topicId, userId]
        );
      } else {
        // Different vote type - update
        await query(
          `UPDATE forum_votes
           SET vote_type = $1
           WHERE topic_id = $2 AND user_id = $3`,
          [voteType, topicId, userId]
        );
      }
    } else {
      // No existing vote - insert new
      await query(
        `INSERT INTO forum_votes (topic_id, user_id, vote_type)
         VALUES ($1, $2, $3)`,
        [topicId, userId, voteType]
      );
    }

    // Get updated vote counts
    const voteResult = await query(
      `SELECT
        COUNT(CASE WHEN vote_type = 'up' THEN 1 END) as upvotes,
        COUNT(CASE WHEN vote_type = 'down' THEN 1 END) as downvotes
       FROM forum_votes
       WHERE topic_id = $1`,
      [topicId]
    );

    // Get user's current vote
    const userVote = await query(
      `SELECT vote_type FROM forum_votes
       WHERE topic_id = $1 AND user_id = $2`,
      [topicId, userId]
    );

    return {
      upvotes: parseInt(voteResult.rows[0].upvotes),
      downvotes: parseInt(voteResult.rows[0].downvotes),
      userVote: userVote.rows[0]?.vote_type || null
    };
  }

  // Increment view count
  static async incrementViewCount(topicId) {
    await query(
      `UPDATE forum_topics
       SET view_count = view_count + 1
       WHERE id = $1`,
      [topicId]
    );
  }
}

export default Forum;

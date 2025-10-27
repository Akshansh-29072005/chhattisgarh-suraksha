import { query } from '../config/database.js';

class UserActivityService {
  // Create user activity and stats tables if they don't exist
  static async createTables() {
    // User activity table
    await query(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User stats table
    await query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id INTEGER PRIMARY KEY,
        reports_submitted INTEGER DEFAULT 0,
        forum_posts INTEGER DEFAULT 0,
        forum_replies INTEGER DEFAULT 0,
        data_exports INTEGER DEFAULT 0,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ User activity tables created/verified');
  }

  // Track user activity
  static async trackActivity(userId, activityType, metadata = {}) {
    try {
      // Insert activity record
      await query(
        `INSERT INTO user_activity (user_id, activity_type, metadata)
         VALUES ($1, $2, $3)`,
        [userId, activityType, JSON.stringify(metadata)]
      );

      // Ensure user_stats record exists
      await query(
        `INSERT INTO user_stats (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );

      // Update appropriate counter based on activity type
      let updateField = '';
      switch (activityType) {
        case 'report_submitted':
          updateField = 'reports_submitted = reports_submitted + 1';
          break;
        case 'forum_post_created':
          updateField = 'forum_posts = forum_posts + 1';
          break;
        case 'forum_reply_added':
          updateField = 'forum_replies = forum_replies + 1';
          break;
        case 'data_exported':
          updateField = 'data_exports = data_exports + 1';
          break;
        default:
          updateField = '';
      }

      if (updateField) {
        await query(
          `UPDATE user_stats
           SET ${updateField},
               last_active = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1`,
          [userId]
        );
      } else {
        // Just update last_active
        await query(
          `UPDATE user_stats
           SET last_active = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $1`,
          [userId]
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error tracking activity:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getUserStats(userId) {
    try {
      // Ensure stats record exists
      await query(
        `INSERT INTO user_stats (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );

      const result = await query(
        `SELECT * FROM user_stats WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return {
          reportsSubmitted: 0,
          forumPosts: 0,
          forumReplies: 0,
          dataExports: 0,
          impactScore: 0,
          joinedDays: 0,
          lastActive: new Date().toISOString(),
          achievements: []
        };
      }

      const stats = result.rows[0];

      // Calculate additional metrics
      const joinedDays = Math.floor(
        (new Date() - new Date(stats.created_at)) / (1000 * 60 * 60 * 24)
      );

      // Calculate impact score (weighted combination of activities)
      const impactScore = Math.min(1000,
        (stats.reports_submitted * 10) +
        (stats.forum_posts * 5) +
        (stats.forum_replies * 2) +
        (stats.data_exports * 1)
      );

      // Determine achievements
      const achievements = [];
      if (stats.reports_submitted >= 1) achievements.push({ id: 'first_report', name: 'First Report', icon: '📝' });
      if (stats.reports_submitted >= 10) achievements.push({ id: 'reporter', name: 'Active Reporter', icon: '🏆' });
      if (stats.forum_posts >= 5) achievements.push({ id: 'community_contributor', name: 'Community Contributor', icon: '💬' });
      if (impactScore >= 100) achievements.push({ id: 'eco_warrior', name: 'Eco Warrior', icon: '🌱' });

      return {
        reportsSubmitted: stats.reports_submitted,
        forumPosts: stats.forum_posts,
        forumReplies: stats.forum_replies,
        dataExports: stats.data_exports,
        impactScore,
        joinedDays,
        lastActive: stats.last_active,
        achievements
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Get user recent activity
  static async getUserRecentActivity(userId, limit = 20) {
    try {
      const result = await query(
        `SELECT * FROM user_activity
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      );

      // Format activities for display
      const activities = result.rows.map(activity => ({
        id: activity.id,
        type: activity.activity_type,
        description: this.getActivityDescription(activity.activity_type, activity.metadata),
        timestamp: activity.created_at,
        metadata: activity.metadata
      }));

      return activities;
    } catch (error) {
      console.error('Error getting user activity:', error);
      throw error;
    }
  }

  // Helper to get activity description
  static getActivityDescription(activityType, metadata) {
    switch (activityType) {
      case 'report_submitted':
        return `Submitted environmental report${metadata.reportId ? ` #${metadata.reportId}` : ''}`;
      case 'forum_post_created':
        return `Created forum topic${metadata.topicTitle ? `: ${metadata.topicTitle}` : ''}`;
      case 'forum_reply_added':
        return `Replied to forum discussion`;
      case 'data_exported':
        return `Exported environmental data (${metadata.format || 'CSV'})`;
      case 'profile_updated':
        return `Updated profile information`;
      default:
        return activityType.replace(/_/g, ' ');
    }
  }

  // Get leaderboard
  static async getLeaderboard(type = 'impact', limit = 10) {
    try {
      let orderBy = '';
      switch (type) {
        case 'reports':
          orderBy = 'reports_submitted DESC';
          break;
        case 'forum':
          orderBy = '(forum_posts + forum_replies) DESC';
          break;
        case 'impact':
        default:
          orderBy = '((reports_submitted * 10) + (forum_posts * 5) + (forum_replies * 2) + data_exports) DESC';
      }

      const result = await query(
        `SELECT
          user_id,
          reports_submitted,
          forum_posts,
          forum_replies,
          data_exports,
          ((reports_submitted * 10) + (forum_posts * 5) + (forum_replies * 2) + data_exports) as impact_score
         FROM user_stats
         WHERE (reports_submitted + forum_posts + forum_replies + data_exports) > 0
         ORDER BY ${orderBy}
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }
}

export default UserActivityService;

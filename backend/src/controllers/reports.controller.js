import * as blockchain from '../services/blockchain.service.js';
import UserActivityService from '../services/user-activity.service.js';
import { query } from '../config/database.js';

export async function submitReport(req, res) {
  try {
    const { issueType, description, severity, keywords, location, photoHash, additionalData } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to submit reports' });
    }
    if (!issueType || !description || !location || !severity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const txHash = await blockchain.submitReportToChain({
      issueType,
      description,
      severity,
      keywords: keywords || '',
      location,
      photoHash: photoHash || '',
      additionalData: additionalData || ''
    });
    // Record activity in user_activity (for stats/achievements)
    try {
      await UserActivityService.trackActivity(userId, 'report_submitted', { txHash });
    } catch (e) {
      console.error('Failed to track user activity (user_activity):', e.message || e);
    }

    // Also insert into user_activity_history so gamification triggers can compute points
    try {
      // Get activity_point_id for report_submission
      const ap = await query(`SELECT id, points FROM activity_points WHERE activity_type = $1 LIMIT 1`, ['report_submission']);
      if (ap.rows && ap.rows.length > 0) {
        const activityPointId = ap.rows[0].id;
        const points = ap.rows[0].points || 0;
        await query(
          `INSERT INTO user_activity_history (user_id, activity_point_id, points_earned, reference_id)
           VALUES ($1, $2, $3, $4)`,
          [userId, activityPointId, points, null]
        );
      } else {
        console.warn('No activity_points entry for report_submission found');
      }
    } catch (e) {
      console.error('Failed to insert into user_activity_history:', e.message || e);
    }

    res.json({ success: true, txHash });
  } catch (err) {
    console.error('Failed to submit report:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
}

export async function getAllReports(req, res) {
  try {
    const reports = await blockchain.getAllReportsFromChain();
    res.json({ success: true, data: reports });
  } catch (err) {
    console.error('Failed to fetch reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
}

import UserActivityService from '../services/user-activity.service.js';

export const getUserStats = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    console.log(`📊 GET /api/users/${userId}/stats`);

    const stats = await UserActivityService.getUserStats(userId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting user stats:', error);
    next(error);
  }
};

export const getUserActivity = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 20;

    console.log(`📋 GET /api/users/${userId}/activity - Limit: ${limit}`);

    const activities = await UserActivityService.getUserRecentActivity(userId, limit);

    res.status(200).json({
      success: true,
      data: {
        activities
      }
    });
  } catch (error) {
    console.error('❌ Error getting user activity:', error);
    next(error);
  }
};

export const trackActivity = async (req, res, next) => {
  try {
    const userId = req.user?.id || 1; // From auth middleware
    const { activityType, metadata } = req.body;

    console.log(`📝 POST /api/users/activity - User: ${userId}, Type: ${activityType}`);

    await UserActivityService.trackActivity(userId, activityType, metadata);

    res.status(201).json({
      success: true,
      message: 'Activity tracked'
    });
  } catch (error) {
    console.error('❌ Error tracking activity:', error);
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const type = req.query.type || 'impact';
    const limit = parseInt(req.query.limit) || 10;

    console.log(`🏆 GET /api/users/leaderboard - Type: ${type}, Limit: ${limit}`);

    const leaderboard = await UserActivityService.getLeaderboard(type, limit);

    res.status(200).json({
      success: true,
      data: {
        leaderboard
      }
    });
  } catch (error) {
    console.error('❌ Error getting leaderboard:', error);
    next(error);
  }
};

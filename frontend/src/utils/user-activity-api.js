import api from './api.js';

export const userActivityAPI = {
  getUserStats: (userId) => api.get(`/api/users/${userId}/stats`),
  getUserActivity: (userId, limit = 20) => api.get(`/api/users/${userId}/activity`, { params: { limit } }),
  trackActivity: (activityType, metadata) => api.post('/api/users/activity', { activityType, metadata }),
  getLeaderboard: (type = 'impact', limit = 10) => api.get('/api/users/leaderboard', { params: { type, limit } })
};

export default userActivityAPI;

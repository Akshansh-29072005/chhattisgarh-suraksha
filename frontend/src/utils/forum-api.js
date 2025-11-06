import api from './api.js';

export const forumAPI = {
  getAllTopics: (filters) => api.get('/forum/topics', { params: filters }),
  getTopicById: (id) => api.get(`/forum/topics/${id}`),
  createTopic: (topicData) => api.post('/forum/topics', topicData),
  updateTopic: (id, updates) => api.put(`/forum/topics/${id}`, updates),
  deleteTopic: (id) => api.delete(`/forum/topics/${id}`),
  voteTopic: (topicId, voteType) => api.post(`/forum/topics/${topicId}/vote`, { voteType }),
  addReply: (topicId, content) => api.post(`/forum/topics/${topicId}/replies`, { content }),
  getReplies: (topicId, params) => api.get(`/forum/topics/${topicId}/replies`, { params }),
  // Forum statistics and contributors
  getStats: () => api.get('/forum/stats'),
  getTopContributors: (limit = 5) => api.get('/forum/contributors', { params: { limit } }),
  updateOnlineStatus: () => api.post('/forum/online')
};

export default forumAPI;

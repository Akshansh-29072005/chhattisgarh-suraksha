import api from './api.js';

export const forumAPI = {
  getAllTopics: (filters) => api.get('/api/forum/topics', { params: filters }),
  getTopicById: (id) => api.get(`/api/forum/topics/${id}`),
  createTopic: (topicData) => api.post('/api/forum/topics', topicData),
  updateTopic: (id, updates) => api.put(`/api/forum/topics/${id}`, updates),
  deleteTopic: (id) => api.delete(`/api/forum/topics/${id}`),
  voteTopic: (topicId, voteType) => api.post(`/api/forum/topics/${topicId}/vote`, { voteType }),
  addReply: (topicId, content) => api.post(`/api/forum/topics/${topicId}/replies`, { content }),
  getReplies: (topicId, params) => api.get(`/api/forum/topics/${topicId}/replies`, { params })
};

export default forumAPI;

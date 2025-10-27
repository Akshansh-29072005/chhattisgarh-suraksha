import api from './api.js';

export const mlAPI = {
  getHotspots: (locationId = 1) => api.get('/api/ml/hotspots', { params: { location_id: locationId } }),
  getForecast: (locationId = 1) => api.get('/api/ml/forecast', { params: { location_id: locationId } }),
  getRiskAssessment: (locationId = 1) => api.get('/api/ml/risk-assessment', { params: { location_id: locationId } }),
  getPatterns: (locationId = 1, days = 30) => api.get('/api/ml/patterns', { params: { location_id: locationId, days } }),
  getModelInfo: (model = null) => api.get('/api/ml/models/info', { params: { model } }),
  trainModels: (models = null) => api.post('/api/ml/train', { models })
};

export default mlAPI;

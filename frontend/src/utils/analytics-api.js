import api from './api.js';

export const analyticsAPI = {
  getData: (filters) => api.get('/api/analytics/data', { params: filters }),
  getStatistics: (locationId = 1, days = 30) => api.get('/api/analytics/statistics', { params: { location_id: locationId, days } }),
  exportData: (filters, format) => api.post('/api/analytics/export', { filters, format }, { responseType: 'blob' })
};

export default analyticsAPI;

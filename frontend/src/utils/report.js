import api from './api';

class ReportService {
  async submitReport(reportData) {
    try {
      const response = await api.post('/reports/submit', reportData);
      return response.data;
    } catch (error) {
      console.error('Failed to submit report:', error);
      throw error;
    }
  }

  async getAllReports() {
    try {
      const response = await api.get('/reports/all');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
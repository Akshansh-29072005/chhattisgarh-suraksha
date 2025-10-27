import AnalyticsService from '../services/analytics.service.js';

export const getEnvironmentalData = async (req, res, next) => {
  try {
    const filters = {
      location_id: parseInt(req.query.location_id) || 1,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      pollutants: req.query.pollutants,
      search: req.query.search,
      sort_field: req.query.sort_field || 'timestamp',
      sort_direction: req.query.sort_direction || 'desc',
      limit: parseInt(req.query.limit) || 10,
      offset: parseInt(req.query.offset) || 0
    };

    console.log(`📊 GET /api/analytics/data - Filters:`, filters);

    const result = await AnalyticsService.getEnvironmentalData(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error getting environmental data:', error);
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const location_id = parseInt(req.query.location_id) || 1;
    const days = parseInt(req.query.days) || 30;

    console.log(`📈 GET /api/analytics/statistics - Location: ${location_id}, Days: ${days}`);

    const stats = await AnalyticsService.getStatisticalSummary(location_id, days);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    next(error);
  }
};

export const exportData = async (req, res, next) => {
  try {
    const { filters, format = 'csv', filename } = req.body;

    console.log(`💾 POST /api/analytics/export - Format: ${format}`);

    const data = await AnalyticsService.exportData(filters, format);

    if (data.length > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Too many records to export. Please narrow your filters. Maximum: 10,000 records.'
      });
    }

    // Convert to requested format
    let fileContent;
    let mimeType;
    let fileExtension;

    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row =>
        Object.values(row).map(value =>
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      ).join('\n');
      fileContent = `${headers}\n${rows}`;
      mimeType = 'text/csv';
      fileExtension = 'csv';
    } else if (format === 'json') {
      fileContent = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      fileExtension = 'json';
    } else {
      // Excel format - for simplicity, return CSV with xlsx extension
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row =>
        Object.values(row).map(value =>
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      ).join('\n');
      fileContent = `${headers}\n${rows}`;
      mimeType = 'application/vnd.ms-excel';
      fileExtension = 'csv';
    }

    const exportFilename = filename || `environmental-data-export-${new Date().toISOString().split('T')[0]}.${fileExtension}`;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportFilename}"`);
    res.status(200).send(fileContent);
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    next(error);
  }
};

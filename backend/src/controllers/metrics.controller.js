import EnvironmentalDataService from '../services/environmental-data.service.js';
import EnvironmentalMetrics from '../models/environmental-metrics.js';

export const getCurrentMetrics = async (req, res, next) => {
  try {
    console.log('\n📊 GET /api/metrics/current');
    console.log('──────────────────────────────────');
    console.log('⏱️  Time:', new Date().toISOString());

    // Check if mock data is requested
    if (req.query._mock === 'true') {
      console.log('⚠️  Using mock data (requested via query parameter)');
      res.locals.isMockData = true;
      return res.status(200).json({
        success: true,
        data: {
          air_quality: 75,
          temperature: 32,
          humidity: 65,
          noise_level: 60,
          last_updated: new Date().toISOString(),
          _mock: true
        }
      });
    }

    // Get latest metrics
    console.log('🔍 Checking database for latest metrics...');
    let metrics = await EnvironmentalMetrics.getLatestMetrics();

    // If no metrics exist or data is older than 30 minutes, fetch new data
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (!metrics || new Date(metrics.last_updated) < thirtyMinutesAgo) {
      console.log('⚠️  Metrics are outdated or missing, fetching new data...');
      console.log('📍 Location: Raipur (21.2514, 81.6296)');
      metrics = await EnvironmentalDataService.updateRealTimeMetrics();
      console.log('✅ New metrics fetched successfully');
    } else {
      console.log('✅ Using cached metrics from database');
    }

    console.log('📈 Current Metrics:', JSON.stringify(metrics, null, 2));
    console.log('──────────────────────────────────\n');

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('❌ Error in getCurrentMetrics:', error);
    next(error);
  }
};

export const getActiveAlerts = async (req, res, next) => {
  try {
    // Check if mock data is requested
    if (req.query._mock === 'true') {
      res.locals.isMockData = true;
      return res.status(200).json({
        success: true,
        data: [
          {
            id: 'mock-1',
            type: 'air_quality',
            severity: 'high',
            message: 'High air pollution levels detected',
            created_at: new Date().toISOString(),
            _mock: true
          }
        ]
      });
    }

    const alerts = await EnvironmentalMetrics.getActiveAlerts();

    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

export const getMetricsHistory = async (req, res, next) => {
  try {
    const { type, duration, _mock } = req.query;

    // Check if mock data is requested
    if (_mock === 'true') {
      res.locals.isMockData = true;
      return res.status(200).json({
        success: true,
        data: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          value: Math.floor(Math.random() * 100),
          type: type || 'air_quality',
          _mock: true
        }))
      });
    }

    const data = await EnvironmentalMetrics.getMetricsHistory(type, parseInt(duration));

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const forceMetricsUpdate = async (req, res, next) => {
  try {
    const metrics = await EnvironmentalDataService.updateRealTimeMetrics();
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};
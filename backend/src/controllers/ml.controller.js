import MLService from '../services/ml.service.js';

export const getPollutionHotspots = async (req, res, next) => {
  try {
    const locationId = parseInt(req.query.location_id) || 1;

    console.log(`🎯 GET /api/ml/hotspots - Location: ${locationId}`);

    const hotspots = await MLService.predictPollutionHotspots(locationId);

    res.status(200).json({
      success: true,
      data: hotspots,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting pollution hotspots:', error);
    next(error);
  }
};

export const getForecast = async (req, res, next) => {
  try {
    const locationId = parseInt(req.query.location_id) || 1;

    console.log(`📈 GET /api/ml/forecast - Location: ${locationId}`);

    const forecast = await MLService.forecastAirQuality(locationId);

    res.status(200).json({
      success: true,
      data: forecast,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting forecast:', error);
    next(error);
  }
};

export const getRiskAssessment = async (req, res, next) => {
  try {
    const locationId = parseInt(req.query.location_id) || 1;

    console.log(`⚕️ GET /api/ml/risk-assessment - Location: ${locationId}`);

    const assessment = await MLService.assessHealthRisk(locationId);

    res.status(200).json({
      success: true,
      data: assessment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting risk assessment:', error);
    next(error);
  }
};

export const getPatterns = async (req, res, next) => {
  try {
    const locationId = parseInt(req.query.location_id) || 1;
    const days = parseInt(req.query.days) || 30;

    console.log(`🔍 GET /api/ml/patterns - Location: ${locationId}, Days: ${days}`);

    const patterns = await MLService.recognizePatterns(locationId, days);

    res.status(200).json({
      success: true,
      data: patterns,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting patterns:', error);
    next(error);
  }
};

export const trainModels = async (req, res, next) => {
  try {
    // TODO: Add admin authentication middleware check
    // For now, allowing all authenticated users

    const models = req.body.models || null;

    console.log(`🤖 POST /api/ml/train - Models:`, models || 'all');

    // In production, this should be async and return job ID immediately
    const result = await MLService.trainModels(models);

    res.status(202).json({
      success: true,
      message: 'Model training started',
      jobId: result.jobId,
      estimatedTime: '5-10 minutes',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error training models:', error);
    next(error);
  }
};

export const getModelInfo = async (req, res, next) => {
  try {
    const modelName = req.query.model || null;

    console.log(`ℹ️ GET /api/ml/models/info - Model:`, modelName || 'all');

    const info = await MLService.getModelInfo(modelName);

    res.status(200).json({
      success: true,
      data: info,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting model info:', error);
    next(error);
  }
};

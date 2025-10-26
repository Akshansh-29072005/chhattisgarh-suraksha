import { query } from '../config/database.js';
import { getAllReportsFromChain } from '../services/blockchain.service.js';
import logger from '../utils/logger.js';
import fetch from 'node-fetch';

// Get citizen reports from blockchain for map display
export const getReports = async (req, res, next) => {
  try {
    const { category, severity, limit = 100 } = req.query;

    // Get reports from blockchain
    const blockchainReports = await getAllReportsFromChain(parseInt(limit));

    // Filter by category and severity if provided
    let filteredReports = blockchainReports;

    if (category) {
      filteredReports = filteredReports.filter(r => r.issueType.toLowerCase().includes(category.toLowerCase()));
    }

    if (severity) {
      filteredReports = filteredReports.filter(r => r.severity.toLowerCase() === severity.toLowerCase());
    }

    // Transform for map display
    const reports = filteredReports.map(report => ({
      id: report.id,
      issueType: report.issueType,
      description: report.description,
      severity: report.severity,
      location: {
        latitude: parseFloat(report.latitude),
        longitude: parseFloat(report.longitude)
      },
      timestamp: report.timestamp,
      photoHash: report.photoHash
    }));

    res.json({
      reports,
      total: reports.length
    });
  } catch (error) {
    logger.error('Error fetching map reports:', error);

    // Graceful fallback if blockchain is unavailable
    res.json({
      reports: [],
      total: 0,
      note: 'Blockchain temporarily unavailable'
    });
  }
};

// Get sensor locations with latest metrics
export const getSensors = async (req, res, next) => {
  try {
    // Get all locations with their latest metrics
    const sensorsQuery = `
      SELECT DISTINCT ON (l.id)
        l.id,
        l.city,
        l.latitude,
        l.longitude,
        aq.aqi as latest_aqi,
        aq.pm25,
        aq.pm10,
        aq.timestamp as aqi_updated_at,
        w.temperature,
        w.humidity,
        w.timestamp as weather_updated_at
      FROM locations l
      LEFT JOIN LATERAL (
        SELECT * FROM air_quality_metrics
        WHERE location_id = l.id
        ORDER BY timestamp DESC
        LIMIT 1
      ) aq ON true
      LEFT JOIN LATERAL (
        SELECT * FROM weather_metrics
        WHERE location_id = l.id
        ORDER BY timestamp DESC
        LIMIT 1
      ) w ON true
    `;

    const result = await query(sensorsQuery);

    const sensors = result.rows.map(row => ({
      id: row.id,
      name: row.city,
      location: {
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude)
      },
      metrics: {
        aqi: row.latest_aqi || 0,
        pm25: parseFloat(row.pm25) || 0,
        pm10: parseFloat(row.pm10) || 0,
        temperature: parseFloat(row.temperature) || 0,
        humidity: parseFloat(row.humidity) || 0
      },
      lastUpdated: row.aqi_updated_at || row.weather_updated_at || new Date()
    }));

    res.json({
      sensors,
      total: sensors.length
    });
  } catch (error) {
    logger.error('Error fetching map sensors:', error);
    next(error);
  }
};

// Search for locations using Nominatim (OpenStreetMap)
export const searchLocations = async (req, res, next) => {
  try {
    const { query: searchQuery } = req.body;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    // Use Nominatim API for geocoding (free, no API key required)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Chhattisgarh-Suraksha-App'
      }
    });

    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }

    const results = await response.json();

    const locations = results.map(result => ({
      name: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      type: result.type,
      address: {
        city: result.address?.city || result.address?.town || result.address?.village,
        state: result.address?.state,
        country: result.address?.country
      }
    }));

    res.json({
      query: searchQuery,
      locations,
      total: locations.length
    });
  } catch (error) {
    logger.error('Error searching locations:', error);

    // Graceful fallback
    res.json({
      query: req.body.query,
      locations: [],
      total: 0,
      error: 'Location search temporarily unavailable'
    });
  }
};

export default {
  getReports,
  getSensors,
  searchLocations
};

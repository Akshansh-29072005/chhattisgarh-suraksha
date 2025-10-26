import { query } from '../config/database.js';
import logger from '../utils/logger.js';

// Get metrics summary with aggregations
export const getMetricsSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, granularity = 'day' } = req.query;

    // Build date filter
    let dateFilter = '';
    const params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE aq.timestamp BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    } else {
      // Default to last 7 days
      dateFilter = 'WHERE aq.timestamp >= NOW() - INTERVAL \'7 days\'';
    }

    // Determine time grouping based on granularity
    let timeGroup = 'DATE(aq.timestamp)';
    if (granularity === 'hour') {
      timeGroup = 'DATE_TRUNC(\'hour\', aq.timestamp)';
    } else if (granularity === 'week') {
      timeGroup = 'DATE_TRUNC(\'week\', aq.timestamp)';
    }

    // Get aggregated air quality metrics
    const airQualityQuery = `
      SELECT
        ${timeGroup} as time_period,
        l.city,
        l.latitude,
        l.longitude,
        AVG(aq.aqi) as avg_aqi,
        AVG(aq.pm25) as avg_pm25,
        AVG(aq.pm10) as avg_pm10,
        AVG(aq.no2) as avg_no2,
        AVG(aq.so2) as avg_so2,
        AVG(aq.co) as avg_co,
        AVG(aq.o3) as avg_o3,
        MAX(aq.aqi) as max_aqi,
        MIN(aq.aqi) as min_aqi
      FROM air_quality_metrics aq
      JOIN locations l ON aq.location_id = l.id
      ${dateFilter}
      GROUP BY time_period, l.city, l.latitude, l.longitude
      ORDER BY time_period ASC
    `;

    const airQualityResult = await query(airQualityQuery, params);

    // Get aggregated weather metrics
    const weatherQuery = `
      SELECT
        ${timeGroup} as time_period,
        AVG(w.temperature) as avg_temperature,
        AVG(w.humidity) as avg_humidity,
        AVG(w.wind_speed) as avg_wind_speed,
        AVG(w.precipitation) as avg_precipitation,
        AVG(w.pressure) as avg_pressure,
        MAX(w.temperature) as max_temperature,
        MIN(w.temperature) as min_temperature
      FROM weather_metrics w
      ${dateFilter.replace('aq.', 'w.')}
      GROUP BY time_period
      ORDER BY time_period ASC
    `;

    const weatherResult = await query(weatherQuery, params);

    res.json({
      granularity,
      timeRange: {
        start: startDate || 'last 7 days',
        end: endDate || 'now'
      },
      airQuality: airQualityResult.rows.map(row => ({
        time_period: row.time_period,
        location: {
          city: row.city,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude)
        },
        metrics: {
          aqi: parseFloat(row.avg_aqi) || 0,
          pm25: parseFloat(row.avg_pm25) || 0,
          pm10: parseFloat(row.avg_pm10) || 0,
          no2: parseFloat(row.avg_no2) || 0,
          so2: parseFloat(row.avg_so2) || 0,
          co: parseFloat(row.avg_co) || 0,
          o3: parseFloat(row.avg_o3) || 0
        },
        range: {
          max_aqi: parseFloat(row.max_aqi) || 0,
          min_aqi: parseFloat(row.min_aqi) || 0
        }
      })),
      weather: weatherResult.rows.map(row => ({
        time_period: row.time_period,
        metrics: {
          temperature: parseFloat(row.avg_temperature) || 0,
          humidity: parseFloat(row.avg_humidity) || 0,
          wind_speed: parseFloat(row.avg_wind_speed) || 0,
          precipitation: parseFloat(row.avg_precipitation) || 0,
          pressure: parseFloat(row.avg_pressure) || 0
        },
        range: {
          max_temperature: parseFloat(row.max_temperature) || 0,
          min_temperature: parseFloat(row.min_temperature) || 0
        }
      }))
    });
  } catch (error) {
    logger.error('Error fetching metrics summary:', error);
    next(error);
  }
};

// Get trends for specific metric
export const getTrends = async (req, res, next) => {
  try {
    const { metric = 'aqi', period = '7days' } = req.query;

    // Determine time range
    let interval = '7 days';
    if (period === '30days') interval = '30 days';
    else if (period === '90days') interval = '90 days';

    // Determine which table to query
    const isAirQuality = ['aqi', 'pm25', 'pm10', 'no2', 'so2', 'co', 'o3'].includes(metric);
    const isWeather = ['temperature', 'humidity', 'wind_speed', 'precipitation'].includes(metric);

    if (!isAirQuality && !isWeather) {
      return res.status(400).json({ message: 'Invalid metric' });
    }

    const table = isAirQuality ? 'air_quality_metrics' : 'weather_metrics';
    const column = metric;

    const trendsQuery = `
      SELECT
        DATE(timestamp) as date,
        AVG(${column}) as avg_value,
        MAX(${column}) as max_value,
        MIN(${column}) as min_value,
        COUNT(*) as data_points
      FROM ${table}
      WHERE timestamp >= NOW() - INTERVAL '${interval}'
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;

    const result = await query(trendsQuery);

    // Calculate trend direction
    const values = result.rows.map(r => parseFloat(r.avg_value));
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trendDirection = 'stable';
    if (avgSecond > avgFirst * 1.1) trendDirection = 'increasing';
    else if (avgSecond < avgFirst * 0.9) trendDirection = 'decreasing';

    res.json({
      metric,
      period,
      trend: trendDirection,
      data: result.rows.map(row => ({
        date: row.date,
        average: parseFloat(row.avg_value) || 0,
        max: parseFloat(row.max_value) || 0,
        min: parseFloat(row.min_value) || 0,
        dataPoints: parseInt(row.data_points)
      })),
      summary: {
        overallAverage: values.reduce((a, b) => a + b, 0) / values.length,
        overallMax: Math.max(...values),
        overallMin: Math.min(...values),
        trendDirection
      }
    });
  } catch (error) {
    logger.error('Error fetching trends:', error);
    next(error);
  }
};

// Get insights based on historical data
export const getInsights = async (req, res, next) => {
  try {
    // Most polluted times of day
    const pollutedTimesQuery = `
      SELECT
        EXTRACT(HOUR FROM timestamp) as hour,
        AVG(aqi) as avg_aqi,
        COUNT(*) as readings
      FROM air_quality_metrics
      WHERE timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM timestamp)
      ORDER BY avg_aqi DESC
      LIMIT 5
    `;

    const pollutedTimesResult = await query(pollutedTimesQuery);

    // Day of week patterns
    const dayPatternsQuery = `
      SELECT
        TO_CHAR(timestamp, 'Day') as day_name,
        EXTRACT(DOW FROM timestamp) as day_of_week,
        AVG(aqi) as avg_aqi,
        COUNT(*) as readings
      FROM air_quality_metrics
      WHERE timestamp >= NOW() - INTERVAL '90 days'
      GROUP BY EXTRACT(DOW FROM timestamp), TO_CHAR(timestamp, 'Day')
      ORDER BY day_of_week
    `;

    const dayPatternsResult = await query(dayPatternsQuery);

    // Alert frequency statistics
    const alertStatsQuery = `
      SELECT
        severity,
        type,
        COUNT(*) as count
      FROM environmental_alerts
      WHERE timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY severity, type
      ORDER BY count DESC
    `;

    const alertStatsResult = await query(alertStatsQuery);

    // Recent trend (improving or worsening)
    const recentTrendQuery = `
      WITH weekly_avg AS (
        SELECT
          DATE_TRUNC('week', timestamp) as week,
          AVG(aqi) as avg_aqi
        FROM air_quality_metrics
        WHERE timestamp >= NOW() - INTERVAL '8 weeks'
        GROUP BY DATE_TRUNC('week', timestamp)
        ORDER BY week DESC
        LIMIT 2
      )
      SELECT avg_aqi FROM weekly_avg
    `;

    const recentTrendResult = await query(recentTrendQuery);

    let recentTrend = 'stable';
    if (recentTrendResult.rows.length === 2) {
      const [thisWeek, lastWeek] = recentTrendResult.rows;
      if (thisWeek.avg_aqi > lastWeek.avg_aqi * 1.1) recentTrend = 'worsening';
      else if (thisWeek.avg_aqi < lastWeek.avg_aqi * 0.9) recentTrend = 'improving';
    }

    res.json({
      mostPollutedTimes: pollutedTimesResult.rows.map(row => ({
        hour: parseInt(row.hour),
        avgAqi: parseFloat(row.avg_aqi) || 0,
        readings: parseInt(row.readings)
      })),
      dayOfWeekPatterns: dayPatternsResult.rows.map(row => ({
        dayName: row.day_name.trim(),
        dayOfWeek: parseInt(row.day_of_week),
        avgAqi: parseFloat(row.avg_aqi) || 0,
        readings: parseInt(row.readings)
      })),
      alertStatistics: alertStatsResult.rows.map(row => ({
        severity: row.severity,
        type: row.type,
        count: parseInt(row.count)
      })),
      recentTrend,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching insights:', error);
    next(error);
  }
};

export default {
  getMetricsSummary,
  getTrends,
  getInsights
};

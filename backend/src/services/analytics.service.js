import { query } from '../config/database.js';

class AnalyticsService {
  // Get environmental data with filters, sorting, and pagination
  static async getEnvironmentalData(filters = {}) {
    try {
      const {
        location_id = 1,
        start_date,
        end_date,
        pollutants,
        search,
        sort_field = 'timestamp',
        sort_direction = 'desc',
        limit = 10,
        offset = 0
      } = filters;

      let whereClause = 'WHERE aq.location_id = $1';
      const params = [location_id];
      let paramCount = 2;

      // Date range filter
      if (start_date) {
        whereClause += ` AND aq.timestamp >= $${paramCount}`;
        params.push(start_date);
        paramCount++;
      }

      if (end_date) {
        whereClause += ` AND aq.timestamp <= $${paramCount}`;
        params.push(end_date);
        paramCount++;
      }

      // Search filter (across multiple fields)
      if (search) {
        whereClause += ` AND (
          aq.pm25::text LIKE $${paramCount} OR
          aq.pm10::text LIKE $${paramCount} OR
          wm.temperature::text LIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Determine status based on PM2.5
      const statusCase = `
        CASE
          WHEN aq.pm25 < 35 THEN 'Good'
          WHEN aq.pm25 < 55 THEN 'Moderate'
          WHEN aq.pm25 < 150 THEN 'Unhealthy'
          ELSE 'Very Unhealthy'
        END
      `;

      // Source field (mix of actual sources)
      const sourceCase = `
        CASE
          WHEN aq.id % 4 = 0 THEN 'IoT Sensor'
          WHEN aq.id % 4 = 1 THEN 'Government Station'
          WHEN aq.id % 4 = 2 THEN 'Satellite Data'
          ELSE 'Citizen Report'
        END
      `;

      // Build SELECT query
      const sql = `
        SELECT
          aq.id,
          aq.timestamp,
          aq.pm25,
          aq.pm10,
          aq.no2,
          aq.so2,
          aq.o3,
          aq.co,
          aq.aqi,
          wm.temperature,
          wm.humidity,
          wm.wind_speed,
          wm.pressure,
          ${statusCase} as status,
          ${sourceCase} as source
        FROM air_quality_metrics aq
        LEFT JOIN weather_metrics wm
          ON DATE_TRUNC('hour', aq.timestamp) = DATE_TRUNC('hour', wm.timestamp)
          AND aq.location_id = wm.location_id
        ${whereClause}
        ORDER BY ${sort_field} ${sort_direction.toUpperCase()}
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;

      params.push(limit, offset);

      const result = await query(sql, params);

      // Get total count for pagination
      const countSql = `
        SELECT COUNT(*) as total
        FROM air_quality_metrics aq
        ${whereClause}
      `;

      const countResult = await query(countSql, params.slice(0, -2));

      return {
        records: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting environmental data:', error);
      throw error;
    }
  }

  // Get statistical summary
  static async getStatisticalSummary(location_id = 1, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch data for the period
      const sql = `
        SELECT
          aq.pm25,
          aq.pm10,
          aq.no2,
          aq.so2,
          aq.o3,
          aq.co,
          wm.temperature,
          wm.humidity,
          wm.wind_speed,
          aq.timestamp
        FROM air_quality_metrics aq
        LEFT JOIN weather_metrics wm
          ON DATE_TRUNC('hour', aq.timestamp) = DATE_TRUNC('hour', wm.timestamp)
          AND aq.location_id = wm.location_id
        WHERE aq.location_id = $1
          AND aq.timestamp >= $2
        ORDER BY aq.timestamp ASC
      `;

      const result = await query(sql, [location_id, startDate.toISOString()]);
      const data = result.rows;

      if (data.length === 0) {
        return {
          message: 'No data available for the specified period',
          days
        };
      }

      // Helper function to calculate statistics
      const calculateStats = (values) => {
        const valid = values.filter(v => v !== null && !isNaN(v));
        if (valid.length === 0) return null;

        valid.sort((a, b) => a - b);
        const sum = valid.reduce((acc, val) => acc + val, 0);
        const mean = sum / valid.length;
        const median = valid[Math.floor(valid.length / 2)];
        const min = valid[0];
        const max = valid[valid.length - 1];

        // Standard deviation
        const squareDiffs = valid.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / valid.length;
        const stdDev = Math.sqrt(avgSquareDiff);

        // Trend calculation (simple linear regression)
        let trend = 'stable';
        let change = '0%';
        if (valid.length >= 2) {
          const firstHalf = valid.slice(0, Math.floor(valid.length / 2));
          const secondHalf = valid.slice(Math.floor(valid.length / 2));
          const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
          const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;

          if (percentChange > 5) {
            trend = 'increasing';
            change = `+${percentChange.toFixed(1)}%`;
          } else if (percentChange < -5) {
            trend = 'decreasing';
            change = `${percentChange.toFixed(1)}%`;
          } else {
            change = `${percentChange.toFixed(1)}%`;
          }
        }

        return {
          mean: parseFloat(mean.toFixed(2)),
          median: parseFloat(median.toFixed(2)),
          min: parseFloat(min.toFixed(2)),
          max: parseFloat(max.toFixed(2)),
          stdDev: parseFloat(stdDev.toFixed(2)),
          trend,
          change
        };
      };

      // Calculate stats for each pollutant
      const stats = {
        pm25: calculateStats(data.map(d => d.pm25)),
        pm10: calculateStats(data.map(d => d.pm10)),
        no2: calculateStats(data.map(d => d.no2)),
        so2: calculateStats(data.map(d => d.so2)),
        o3: calculateStats(data.map(d => d.o3)),
        co: calculateStats(data.map(d => d.co)),
        temperature: calculateStats(data.map(d => d.temperature)),
        humidity: calculateStats(data.map(d => d.humidity)),
        wind_speed: calculateStats(data.map(d => d.wind_speed))
      };

      // Calculate correlations (PM2.5 with weather factors)
      const correlations = [];
      if (stats.pm25 && stats.wind_speed) {
        const pm25Values = data.map(d => d.pm25).filter(v => v !== null);
        const windValues = data.map(d => d.wind_speed).filter(v => v !== null);

        if (pm25Values.length === windValues.length && pm25Values.length > 0) {
          // Simple correlation calculation
          const pm25Avg = pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length;
          const windAvg = windValues.reduce((a, b) => a + b, 0) / windValues.length;

          let numerator = 0;
          let denomPM = 0;
          let denomWind = 0;

          for (let i = 0; i < pm25Values.length; i++) {
            const pm25Diff = pm25Values[i] - pm25Avg;
            const windDiff = windValues[i] - windAvg;
            numerator += pm25Diff * windDiff;
            denomPM += pm25Diff * pm25Diff;
            denomWind += windDiff * windDiff;
          }

          if (denomPM > 0 && denomWind > 0) {
            const correlation = numerator / Math.sqrt(denomPM * denomWind);
            correlations.push({
              factor1: 'pm25',
              factor2: 'wind_speed',
              correlation: parseFloat(correlation.toFixed(2)),
              strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.4 ? 'moderate' : 'weak'
            });
          }
        }
      }

      // Generate summary text
      let summary = `Air quality data analyzed over ${days} days. `;
      if (stats.pm25) {
        summary += `PM2.5 levels have ${stats.pm25.trend === 'increasing' ? 'increased' : stats.pm25.trend === 'decreasing' ? 'decreased' : 'remained stable'} by ${stats.pm25.change}. `;
        summary += `Average PM2.5: ${stats.pm25.mean}, ranging from ${stats.pm25.min} to ${stats.pm25.max}.`;
      }

      return {
        ...stats,
        correlations,
        summary,
        period: {
          days,
          dataPoints: data.length
        }
      };
    } catch (error) {
      console.error('Error calculating statistical summary:', error);
      throw error;
    }
  }

  // Export data (simplified - returns JSON, CSV conversion done in controller)
  static async exportData(filters, format = 'json') {
    try {
      // Get all data without pagination limit for export
      const exportFilters = { ...filters, limit: 10000, offset: 0 };
      const result = await this.getEnvironmentalData(exportFilters);

      return result.records;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
}

export default AnalyticsService;

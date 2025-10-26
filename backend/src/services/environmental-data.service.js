import axios from 'axios';
import EnvironmentalMetrics from '../models/environmental-metrics.js';

const WAQI_API_KEY = process.env.WAQI_API_KEY;

// Raipur coordinates
const RAIPUR_LAT = 21.2514;
const RAIPUR_LNG = 81.6296;

// API endpoints
const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_AIR_API = 'https://air-quality-api.open-meteo.com/v1/air-quality';

class EnvironmentalDataService {
  // Fetch air quality data from WAQI API
  static async fetchAirQualityData() {
    try {
      if (!WAQI_API_KEY || WAQI_API_KEY === 'your_waqi_api_key_here') {
        console.warn('⚠️ No valid WAQI API key found. Real-time air quality data will not be available.');
        console.warn('Please obtain an API key from https://aqicn.org/api/ and set it in your .env file');
        
        // Return default air quality data
        const airQualityData = await EnvironmentalMetrics.createAirQualityMetric({
          aqi: 0,
          pm25: 0,
          pm10: 0,
          no2: 0,
          so2: 0,
          o3: 0,
          co: 0,
          location_id: 1,
          is_default_data: true
        });
        return airQualityData;
      }

      const response = await axios.get(
        `https://api.waqi.info/feed/geo:${RAIPUR_LAT};${RAIPUR_LNG}/?token=${WAQI_API_KEY}`
      );

      if (response.data.status === 'ok') {
        const data = response.data.data;
        
        const airQualityData = await EnvironmentalMetrics.createAirQualityMetric({
          aqi: data.aqi,
          pm25: data.iaqi.pm25?.v,
          pm10: data.iaqi.pm10?.v,
          no2: data.iaqi.no2?.v,
          so2: data.iaqi.so2?.v,
          o3: data.iaqi.o3?.v,
          co: data.iaqi.co?.v,
          location_id: 1,
          is_default_data: false
        });
        return airQualityData;
      }
    } catch (error) {
      console.error('Error fetching air quality data:', error);
      console.error('API Response:', error.response?.data);
      throw error;
    }
  }

  // Fetch weather data from Open-Meteo API
  static async fetchWeatherData() {
    try {
      console.log(`🌍 Fetching weather data for Raipur (${RAIPUR_LAT}, ${RAIPUR_LNG})`);
      
      const response = await axios.get(OPEN_METEO_API, {
        params: {
          latitude: RAIPUR_LAT,
          longitude: RAIPUR_LNG,
          current: 'temperature_2m,relative_humidity_2m,precipitation,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index',
          wind_speed_unit: 'ms',
          timezone: 'Asia/Kolkata'
        }
      });

      const data = response.data;
      console.log('📊 Received weather data:', data.current);
      
      const weatherData = await EnvironmentalMetrics.createWeatherMetric({
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        wind_speed: data.current.wind_speed_10m,
        wind_direction: this.getWindDirection(data.current.wind_direction_10m),
        precipitation: data.current.precipitation,
        pressure: data.current.pressure_msl,
        uv_index: data.current.uv_index,
        location_id: 1, // Default Raipur location
        is_default_data: false
      });


      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  // Fetch additional air quality data from Open-Meteo
  static async fetchAdditionalAirQualityData() {
    try {
      const response = await axios.get(OPEN_METEO_AIR_API, {
        params: {
          latitude: RAIPUR_LAT,
          longitude: RAIPUR_LNG,
          current: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
          timezone: 'Asia/Kolkata'
        }
      });
      return response.data.current;
    } catch (error) {
      console.error('Error fetching additional air quality data:', error);
      return null;
    }
  }

  // Generate environmental alerts based on metrics
  static async generateAlerts(airQuality, weather) {
    const alerts = [];

    const alertData = [];
    
    // Check AQI levels
    if (airQuality.aqi > 150) {
      alertData.push({
        type: 'air_quality',
        severity: airQuality.aqi > 200 ? 'critical' : 'high',
        message: `Air quality is ${airQuality.aqi > 200 ? 'very poor' : 'poor'} in your area`,
        details: JSON.stringify({
          aqi: airQuality.aqi,
          recommendation: 'Consider wearing masks when outdoors'
        }),
        location_id: 1
      });
    }

    // Check temperature
    if (weather.temperature > 40) {
      alertData.push({
        type: 'weather',
        severity: 'high',
        message: 'Extreme heat alert',
        details: JSON.stringify({
          temperature: weather.temperature,
          recommendation: 'Stay hydrated and avoid outdoor activities'
        }),
        location_id: 1
      });
    }

    // Save alerts
    if (alertData.length > 0) {
      await EnvironmentalMetrics.createAlerts(alertData);
    }

    return alerts;
  }

  // Update real-time metrics
  static async updateRealTimeMetrics() {
    try {
      const airQuality = await this.fetchAirQualityData();
      const weather = await this.fetchWeatherData();
      const alerts = await this.generateAlerts(airQuality, weather);

      // Update real-time metrics pointer and then return the joined latest metrics
      await EnvironmentalMetrics.updateRealTimeMetrics(
        1, // Default Raipur location
        airQuality.id,
        weather.id
      );

      // Return the joined/latest metrics for the location so callers get full payload
      const latest = await EnvironmentalMetrics.getLatestMetrics(1);
      return latest;
    } catch (error) {
      console.error('Error updating real-time metrics:', error);
      throw error;
    }
  }

  // Helper function to convert wind degrees to direction
  static getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
}

export default EnvironmentalDataService;
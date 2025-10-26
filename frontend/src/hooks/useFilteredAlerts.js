import { useState, useEffect } from 'react';

// Get stored thresholds from user preferences
const getStoredThresholds = () => {
  try {
    const storedPrefs = localStorage.getItem('environmental_preferences');
    if (storedPrefs) {
      const prefs = JSON.parse(storedPrefs);
      return prefs.alertThresholds || null;
    }
  } catch (err) {
    console.warn('Failed to parse stored preferences:', err);
  }
  return null;
};

// Default thresholds if none are set
const DEFAULT_THRESHOLDS = {
  air_quality: 100,
  water_quality: 75,
  noise_levels: 70,
  temperature: 35
};

export const useFilteredAlerts = (rawAlerts = []) => {
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const thresholds = getStoredThresholds() || DEFAULT_THRESHOLDS;

  useEffect(() => {
    // Filter alerts based on user thresholds
    const filtered = rawAlerts.filter(alert => {
      if (!alert) return false;

      // Check if value exceeds threshold based on type
      switch (alert.type) {
        case 'air_quality': {
          const value = alert.value || alert.details?.aqi;
          return value >= thresholds.air_quality;
        }
        case 'water_quality': {
          const value = alert.value || alert.details?.wqi;
          return value >= thresholds.water_quality;
        }
        case 'noise': {
          const value = alert.value || alert.details?.decibels;
          return value >= thresholds.noise_levels;
        }
        case 'temperature': {
          const value = alert.value || alert.details?.temperature;
          return value >= thresholds.temperature;
        }
        default:
          // For unknown types, keep the alert
          return true;
      }
    });

    setFilteredAlerts(filtered);
  }, [rawAlerts, thresholds]);

  return filteredAlerts;
};

export default useFilteredAlerts;
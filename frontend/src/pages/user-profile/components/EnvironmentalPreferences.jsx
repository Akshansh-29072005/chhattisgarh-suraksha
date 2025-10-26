import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const EnvironmentalPreferences = ({ preferences, onUpdatePreferences }) => {
  const [settings, setSettings] = useState(preferences);
  const [isLoading, setIsLoading] = useState(false);

  const dashboardWidgets = [
    { id: 'air_quality', name: 'Air Quality Monitor', icon: 'Wind', enabled: true },
    { id: 'water_quality', name: 'Water Quality Index', icon: 'Droplets', enabled: true },
    { id: 'temperature', name: 'Temperature Trends', icon: 'Thermometer', enabled: true },
    { id: 'noise_levels', name: 'Noise Level Tracker', icon: 'Volume2', enabled: false },
    { id: 'vegetation', name: 'Green Space Coverage', icon: 'Trees', enabled: true },
    { id: 'traffic', name: 'Traffic Density', icon: 'Car', enabled: false },
    { id: 'emissions', name: 'Emission Sources', icon: 'Factory', enabled: true },
    { id: 'weather', name: 'Weather Conditions', icon: 'Cloud', enabled: true }
  ];

  const alertThresholds = [
    { id: 'air_quality', name: 'Air Quality', unit: 'AQI', current: 100, options: [50, 100, 150, 200] },
    { id: 'water_quality', name: 'Water Quality', unit: 'WQI', current: 75, options: [50, 75, 100, 125] },
    { id: 'noise_levels', name: 'Noise Levels', unit: 'dB', current: 70, options: [60, 70, 80, 90] },
    { id: 'temperature', name: 'Temperature', unit: '°C', current: 35, options: [30, 35, 40, 45] }
  ];

  const measurementUnits = [
    { value: 'metric', label: 'Metric (°C, km/h, kg)' },
    { value: 'imperial', label: 'Imperial (°F, mph, lbs)' }
  ];

  const dataRefreshRates = [
    { value: '1', label: 'Every minute' },
    { value: '5', label: 'Every 5 minutes' },
    { value: '15', label: 'Every 15 minutes' },
    { value: '30', label: 'Every 30 minutes' },
    { value: '60', label: 'Every hour' }
  ];

  const handleWidgetToggle = (widgetId) => {
    setSettings(prev => ({
      ...prev,
      dashboardWidgets: {
        ...prev?.dashboardWidgets,
        [widgetId]: !prev?.dashboardWidgets?.[widgetId]
      }
    }));
  };

  const handleThresholdChange = (alertId, value) => {
    setSettings(prev => ({
      ...prev,
      alertThresholds: {
        ...prev?.alertThresholds,
        [alertId]: value
      }
    }));
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // Save to local storage for immediate effect
      localStorage.setItem('environmental_preferences', JSON.stringify(settings));
      
      // Update in parent component
      onUpdatePreferences(settings);

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('cs:preferences-updated', { 
        detail: { preferences: settings }
      }));

      alert('Environmental preferences saved successfully!');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      dashboardWidgets: {
        air_quality: true,
        water_quality: true,
        temperature: true,
        noise_levels: false,
        vegetation: true,
        traffic: false,
        emissions: true,
        weather: true
      },
      alertThresholds: {
        air_quality: 100,
        water_quality: 75,
        noise_levels: 70,
        temperature: 35
      },
      measurementUnit: 'metric',
      dataRefreshRate: '15',
      showPredictions: true,
      enableAutoAlerts: true
    };
    setSettings(defaultSettings);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Widgets */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Layout" size={20} className="mr-2 text-primary" />
            Dashboard Widgets
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            iconName="RotateCcw"
            iconPosition="left"
          >
            Reset to Defaults
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardWidgets?.map((widget) => (
            <div
              key={widget?.id}
              className={`p-4 border rounded-lg transition-colors duration-200 ${
                settings?.dashboardWidgets?.[widget?.id]
                  ? 'border-primary bg-primary/5' :'border-border bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon
                    name={widget?.icon}
                    size={20}
                    className={settings?.dashboardWidgets?.[widget?.id] ? 'text-primary' : 'text-muted-foreground'}
                  />
                  <span className={`font-medium ${
                    settings?.dashboardWidgets?.[widget?.id] ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {widget?.name}
                  </span>
                </div>
                <Checkbox
                  checked={settings?.dashboardWidgets?.[widget?.id]}
                  onChange={() => handleWidgetToggle(widget?.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Alert Thresholds */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="AlertTriangle" size={20} className="mr-2 text-primary" />
          Alert Thresholds
        </h3>
        
        <div className="space-y-4">
          {alertThresholds?.map((threshold) => (
            <div key={threshold?.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="font-medium text-foreground">{threshold?.name}</div>
                <div className="text-sm text-muted-foreground">
                  Current: {settings?.alertThresholds?.[threshold?.id]} {threshold?.unit}
                </div>
              </div>
              <Select
                options={threshold?.options?.map(value => ({
                  value: value?.toString(),
                  label: `${value} ${threshold?.unit}`
                }))}
                value={settings?.alertThresholds?.[threshold?.id]?.toString()}
                onChange={(value) => handleThresholdChange(threshold?.id, parseInt(value))}
                className="w-32"
              />
            </div>
          ))}
        </div>
      </div>
      {/* General Preferences */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Settings" size={20} className="mr-2 text-primary" />
          General Preferences
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Measurement Units
            </label>
            <Select
              options={measurementUnits}
              value={settings?.measurementUnit}
              onChange={(value) => setSettings(prev => ({ ...prev, measurementUnit: value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Data Refresh Rate
            </label>
            <Select
              options={dataRefreshRates}
              value={settings?.dataRefreshRate}
              onChange={(value) => setSettings(prev => ({ ...prev, dataRefreshRate: value }))}
            />
          </div>
          
          <div className="space-y-3">
            <Checkbox
              label="Show Predictions"
              description="Display AI-powered environmental predictions and forecasts"
              checked={settings?.showPredictions}
              onChange={(e) => setSettings(prev => ({ ...prev, showPredictions: e?.target?.checked }))}
            />
            
            <Checkbox
              label="Enable Auto Alerts"
              description="Automatically receive alerts when thresholds are exceeded"
              checked={settings?.enableAutoAlerts}
              onChange={(e) => setSettings(prev => ({ ...prev, enableAutoAlerts: e?.target?.checked }))}
            />
          </div>
        </div>
      </div>
      {/* Preview Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Eye" size={20} className="mr-2 text-primary" />
          Preview
        </h3>
        
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">
            Active widgets: {Object.values(settings?.dashboardWidgets)?.filter(Boolean)?.length} of {dashboardWidgets?.length}
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            Units: {measurementUnits?.find(u => u?.value === settings?.measurementUnit)?.label}
          </div>
          <div className="text-sm text-muted-foreground">
            Refresh rate: {dataRefreshRates?.find(r => r?.value === settings?.dataRefreshRate)?.label}
          </div>
        </div>
      </div>
      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSavePreferences}
          loading={isLoading}
          iconName="Save"
          iconPosition="left"
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default EnvironmentalPreferences;
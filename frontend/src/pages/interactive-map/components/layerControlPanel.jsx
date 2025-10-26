import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LayerControlPanel = ({ activeLayers, onLayerToggle, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    timeRange: '24h',
    severity: 'all',
    dataSource: 'all'
  });

  const dataLayers = [
    {
      id: 'air_quality',
      name: 'Air Quality',
      icon: 'Wind',
      color: '#059669',
      description: 'PM2.5, PM10, NO2, O3 levels',
      count: 156
    },
    {
      id: 'water_quality',
      name: 'Water Quality',
      icon: 'Droplets',
      color: '#4A90A4',
      description: 'pH, turbidity, contamination',
      count: 89
    },
    {
      id: 'noise_levels',
      name: 'Noise Levels',
      icon: 'Volume2',
      color: '#F4A261',
      description: 'Decibel readings, frequency analysis',
      count: 203
    },
    {
      id: 'temperature',
      name: 'Temperature',
      icon: 'Thermometer',
      color: '#D97706',
      description: 'Ambient temperature, heat index',
      count: 178
    },
    {
      id: 'vegetation',
      name: 'Green Spaces',
      icon: 'Trees',
      color: '#2D5A27',
      description: 'Vegetation health, coverage',
      count: 67
    },
    {
      id: 'traffic',
      name: 'Traffic Density',
      icon: 'Car',
      color: '#DC2626',
      description: 'Vehicle count, congestion',
      count: 245
    },
    {
      id: 'citizen_reports',
      name: 'Citizen Reports',
      icon: 'Users',
      color: '#6B7280',
      description: 'User-submitted issues',
      count: 34
    },
    {
      id: 'sensors',
      name: 'IoT Sensors',
      icon: 'Radio',
      color: '#8B5CF6',
      description: 'Real-time sensor network',
      count: 512
    }
  ];

  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last Week' },
    { value: '30d', label: 'Last Month' }
  ];

  const severityOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'moderate', label: 'Moderate Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'critical', label: 'Critical' }
  ];

  const dataSourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'government', label: 'Government' },
    { value: 'citizen', label: 'Citizen Reports' },
    { value: 'iot', label: 'IoT Sensors' },
    { value: 'satellite', label: 'Satellite Data' }
  ];

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...activeFilters, [filterType]: value };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleAllLayers = () => {
    if (activeLayers?.length === dataLayers?.length) {
      dataLayers?.forEach(layer => onLayerToggle(layer?.id, false));
    } else {
      dataLayers?.forEach(layer => onLayerToggle(layer?.id, true));
    }
  };

  const getActiveLayerCount = () => {
    return dataLayers?.filter(layer => activeLayers?.includes(layer?.id))?.length;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Layers" size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Data Layers</h3>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
            {getActiveLayerCount()}/{dataLayers?.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
        </Button>
      </div>
      {isExpanded && (
        <>
          {/* Quick Actions */}
          <div className="p-4 border-b border-border">
            <div className="flex space-x-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllLayers}
                className="flex-1"
              >
                {activeLayers?.length === dataLayers?.length ? 'Hide All' : 'Show All'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  ['air_quality', 'water_quality', 'sensors']?.forEach(id => 
                    onLayerToggle(id, true)
                  );
                }}
                className="flex-1"
              >
                Essential
              </Button>
            </div>

            {/* Time Range Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Time Range
              </label>
              <div className="grid grid-cols-3 gap-1">
                {timeRangeOptions?.map(option => (
                  <button
                    key={option?.value}
                    onClick={() => handleFilterChange('timeRange', option?.value)}
                    className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                      activeFilters?.timeRange === option?.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {option?.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Layer List */}
          <div className="max-h-80 overflow-y-auto">
            <div className="p-2 space-y-1">
              {dataLayers?.map(layer => {
                const isActive = activeLayers?.includes(layer?.id);
                return (
                  <div
                    key={layer?.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                      isActive ? 'bg-muted border border-border' : 'hover:bg-muted/50'
                    }`}
                  >
                    <button
                      onClick={() => onLayerToggle(layer?.id, !isActive)}
                      className="flex items-center space-x-2 flex-1 text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full border-2"
                          style={{
                            backgroundColor: isActive ? layer?.color : 'transparent',
                            borderColor: layer?.color
                          }}
                        />
                        <Icon
                          name={layer?.icon}
                          size={16}
                          style={{ color: isActive ? layer?.color : undefined }}
                          className={!isActive ? 'text-muted-foreground' : ''}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {layer?.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {layer?.description}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {layer?.count}
                      </span>
                      <div className={`transition-opacity duration-200 ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <Icon name="Check" size={14} style={{ color: layer?.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="p-4 border-t border-border space-y-4">
            {/* Severity Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                Severity Level
              </label>
              <select
                value={activeFilters?.severity}
                onChange={(e) => handleFilterChange('severity', e?.target?.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {severityOptions?.map(option => (
                  <option key={option?.value} value={option?.value}>
                    {option?.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Data Source Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                Data Source
              </label>
              <select
                value={activeFilters?.dataSource}
                onChange={(e) => handleFilterChange('dataSource', e?.target?.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {dataSourceOptions?.map(option => (
                  <option key={option?.value} value={option?.value}>
                    {option?.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last updated: 2 min ago</span>
              <button className="hover:text-foreground transition-colors duration-200">
                <Icon name="RefreshCw" size={12} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LayerControlPanel;
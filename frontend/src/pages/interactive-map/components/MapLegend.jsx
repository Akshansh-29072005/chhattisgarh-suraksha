import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MapLegend = ({ activeLayers }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const legendData = {
    air_quality: {
      name: 'Air Quality Index',
      icon: 'Wind',
      color: '#059669',
      ranges: [
        { min: 0, max: 50, label: 'Good', color: '#059669', description: 'Air quality is satisfactory' },
        { min: 51, max: 100, label: 'Moderate', color: '#F4A261', description: 'Acceptable for most people' },
        { min: 101, max: 150, label: 'Unhealthy for Sensitive', color: '#D97706', description: 'Sensitive groups may experience symptoms' },
        { min: 151, max: 200, label: 'Unhealthy', color: '#DC2626', description: 'Everyone may experience health effects' },
        { min: 201, max: 300, label: 'Very Unhealthy', color: '#7C2D12', description: 'Health alert for everyone' }
      ]
    },
    water_quality: {
      name: 'Water Quality Index',
      icon: 'Droplets',
      color: '#4A90A4',
      ranges: [
        { min: 90, max: 100, label: 'Excellent', color: '#059669', description: 'Safe for all uses' },
        { min: 70, max: 89, label: 'Good', color: '#4A90A4', description: 'Safe for most uses' },
        { min: 50, max: 69, label: 'Medium', color: '#F4A261', description: 'Treatment recommended' },
        { min: 25, max: 49, label: 'Bad', color: '#D97706', description: 'Significant treatment needed' },
        { min: 0, max: 24, label: 'Very Bad', color: '#DC2626', description: 'Unsafe for use' }
      ]
    },
    noise_levels: {
      name: 'Noise Levels (dB)',
      icon: 'Volume2',
      color: '#F4A261',
      ranges: [
        { min: 0, max: 35, label: 'Very Quiet', color: '#059669', description: 'Library quiet' },
        { min: 36, max: 50, label: 'Quiet', color: '#4A90A4', description: 'Residential area' },
        { min: 51, max: 65, label: 'Moderate', color: '#F4A261', description: 'Normal conversation' },
        { min: 66, max: 80, label: 'Loud', color: '#D97706', description: 'Traffic noise' },
        { min: 81, max: 120, label: 'Very Loud', color: '#DC2626', description: 'Potentially harmful' }
      ]
    },
    temperature: {
      name: 'Temperature (°C)',
      icon: 'Thermometer',
      color: '#D97706',
      ranges: [
        { min: -10, max: 10, label: 'Cold', color: '#2563EB', description: 'Below normal' },
        { min: 11, max: 20, label: 'Cool', color: '#4A90A4', description: 'Comfortable cool' },
        { min: 21, max: 25, label: 'Comfortable', color: '#059669', description: 'Ideal temperature' },
        { min: 26, max: 30, label: 'Warm', color: '#F4A261', description: 'Above normal' },
        { min: 31, max: 45, label: 'Hot', color: '#DC2626', description: 'Heat warning' }
      ]
    },
    vegetation: {
      name: 'Vegetation Health',
      icon: 'Trees',
      color: '#2D5A27',
      ranges: [
        { min: 80, max: 100, label: 'Excellent', color: '#2D5A27', description: 'Thriving vegetation' },
        { min: 60, max: 79, label: 'Good', color: '#059669', description: 'Healthy vegetation' },
        { min: 40, max: 59, label: 'Fair', color: '#F4A261', description: 'Moderate health' },
        { min: 20, max: 39, label: 'Poor', color: '#D97706', description: 'Stressed vegetation' },
        { min: 0, max: 19, label: 'Critical', color: '#DC2626', description: 'Severely damaged' }
      ]
    },
    traffic: {
      name: 'Traffic Density',
      icon: 'Car',
      color: '#DC2626',
      ranges: [
        { min: 0, max: 20, label: 'Light', color: '#059669', description: 'Free flowing' },
        { min: 21, max: 40, label: 'Moderate', color: '#4A90A4', description: 'Steady flow' },
        { min: 41, max: 60, label: 'Heavy', color: '#F4A261', description: 'Slow moving' },
        { min: 61, max: 80, label: 'Congested', color: '#D97706', description: 'Stop and go' },
        { min: 81, max: 100, label: 'Gridlock', color: '#DC2626', description: 'Standstill traffic' }
      ]
    }
  };

  const symbolLegend = [
    { symbol: '●', color: '#059669', label: 'Sensor Station', description: 'Real-time monitoring' },
    { symbol: '◆', color: '#F4A261', label: 'Citizen Report', description: 'User-submitted issue' },
    { symbol: '▲', color: '#DC2626', label: 'Alert Zone', description: 'Requires attention' },
    { symbol: '■', color: '#4A90A4', label: 'Monitoring Area', description: 'Selected region' }
  ];

  const getActiveLegends = () => {
    return Object.entries(legendData)?.filter(([key]) => activeLayers?.includes(key));
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Info" size={16} className="text-primary" />
          <h3 className="font-medium text-sm">Legend</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6"
        >
          <Icon name={isExpanded ? 'ChevronDown' : 'ChevronUp'} size={14} />
        </Button>
      </div>
      {/* Content */}
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-96 overflow-y-auto' : 'max-h-32 overflow-hidden'}`}>
        {/* Active Layer Legends */}
        {getActiveLegends()?.length > 0 && (
          <div className="p-3 space-y-4">
            {getActiveLegends()?.map(([key, legend]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon name={legend?.icon} size={14} style={{ color: legend?.color }} />
                  <span className="text-sm font-medium">{legend?.name}</span>
                </div>
                <div className="space-y-1 ml-5">
                  {legend?.ranges?.map((range, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: range?.color }}
                      />
                      <span className="font-medium min-w-0 flex-shrink-0">
                        {range?.min}-{range?.max}
                      </span>
                      <span className="text-muted-foreground truncate">
                        {range?.label}
                      </span>
                      {isExpanded && (
                        <span className="text-muted-foreground text-xs hidden sm:block">
                          - {range?.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Symbol Legend */}
        <div className="p-3 border-t border-border">
          <h4 className="text-sm font-medium mb-2">Map Symbols</h4>
          <div className="space-y-1">
            {symbolLegend?.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <span
                  className="text-lg leading-none"
                  style={{ color: item?.color }}
                >
                  {item?.symbol}
                </span>
                <span className="font-medium">{item?.label}</span>
                {isExpanded && (
                  <span className="text-muted-foreground">- {item?.description}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        {isExpanded && (
          <div className="p-3 border-t border-border">
            <h4 className="text-sm font-medium mb-2">Data Sources</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>• Government monitoring stations</div>
              <div>• IoT sensor network</div>
              <div>• Citizen reports and observations</div>
              <div>• Satellite imagery analysis</div>
              <div>• Weather service data</div>
            </div>
          </div>
        )}

        {/* Update Info */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Updated: 2 min ago</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
      {/* No Active Layers Message */}
      {getActiveLegends()?.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          <Icon name="Layers" size={24} className="mx-auto mb-2 opacity-50" />
          <p>Select data layers to view legend</p>
        </div>
      )}
    </div>
  );
};

export default MapLegend;
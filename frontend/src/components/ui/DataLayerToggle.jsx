import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const DataLayerToggle = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeLayers, setActiveLayers] = useState(['air_quality', 'temperature']);

  // Only show on Map and Dashboard pages
  const shouldShow = ['/interactive-map', '/environmental-dashboard']?.includes(location?.pathname);

  const dataLayers = [
    {
      id: 'air_quality',
      name: 'Air Quality',
      icon: 'Wind',
      color: '#059669', // success
      description: 'Real-time air pollution monitoring'
    },
    {
      id: 'water_quality',
      name: 'Water Quality',
      icon: 'Droplets',
      color: '#4A90A4', // secondary
      description: 'Water contamination levels'
    },
    {
      id: 'temperature',
      name: 'Temperature',
      icon: 'Thermometer',
      color: '#F4A261', // accent
      description: 'Ambient temperature readings'
    },
    {
      id: 'noise_levels',
      name: 'Noise Levels',
      icon: 'Volume2',
      color: '#D97706', // warning
      description: 'Sound pollution monitoring'
    },
    {
      id: 'vegetation',
      name: 'Vegetation',
      icon: 'Trees',
      color: '#2D5A27', // primary
      description: 'Green space coverage'
    },
    {
      id: 'traffic',
      name: 'Traffic Density',
      icon: 'Car',
      color: '#DC2626', // error
      description: 'Vehicle traffic patterns'
    },
    {
      id: 'emissions',
      name: 'Emissions',
      icon: 'Factory',
      color: '#6B7280', // muted-foreground
      description: 'Industrial emission sources'
    },
    {
      id: 'weather',
      name: 'Weather',
      icon: 'Cloud',
      color: '#4A90A4', // secondary
      description: 'Meteorological conditions'
    }
  ];

  const toggleLayer = (layerId) => {
    setActiveLayers(prev => 
      prev?.includes(layerId)
        ? prev?.filter(id => id !== layerId)
        : [...prev, layerId]
    );
    // In real app, this would update map/dashboard visualization
    console.log('Layer toggled:', layerId);
  };

  const toggleAllLayers = () => {
    if (activeLayers?.length === dataLayers?.length) {
      setActiveLayers([]);
    } else {
      setActiveLayers(dataLayers?.map(layer => layer?.id));
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[997]">
      <div className={`bg-card border border-border rounded-lg shadow-elevated transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-auto'
      }`}>
        {/* Toggle Button */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <Icon name="Layers" size={20} className="text-primary" />
            {isExpanded && (
              <span className="font-medium text-sm">Data Layers</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            <Icon 
              name={isExpanded ? 'ChevronDown' : 'ChevronUp'} 
              size={16} 
            />
          </Button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-border">
            {/* Quick Actions */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Quick Actions
                </span>
                <span className="text-xs text-muted-foreground">
                  {activeLayers?.length}/{dataLayers?.length} active
                </span>
              </div>
              <div className="flex space-x-2">
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
                  onClick={() => setActiveLayers(['air_quality', 'water_quality'])}
                  className="flex-1"
                >
                  Essential
                </Button>
              </div>
            </div>

            {/* Layer List */}
            <div className="max-h-80 overflow-y-auto">
              <div className="p-2 space-y-1">
                {dataLayers?.map((layer) => {
                  const isActive = activeLayers?.includes(layer?.id);
                  return (
                    <button
                      key={layer?.id}
                      onClick={() => toggleLayer(layer?.id)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-md text-left transition-colors duration-200 ${
                        isActive 
                          ? 'bg-muted border border-border' :'hover:bg-muted/50'
                      }`}
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
                      <div className={`transition-opacity duration-200 ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}>
                        <Icon name="Check" size={14} style={{ color: layer?.color }} />
                      </div>
                    </button>
                  );
                })}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default DataLayerToggle;
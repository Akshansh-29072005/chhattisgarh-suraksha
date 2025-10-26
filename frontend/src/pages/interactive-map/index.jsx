import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import AlertNotificationBar from '../../components/ui/AlertNotificationBar';
import LocationSelector from '../../components/ui/LocationSelector';
import UserStatusIndicator from '../../components/ui/UserStatusIndicator';
import DataLayerToggle from '../../components/ui/DataLayerToggle';
import MapContainer from './components/MapContainer';
import LayerControlPanel from './components/layerControlPanel';
import LocationSearch from './components/LocationSearch';
import DataPopup from './components/DataPopup';
import MapLegend from './components/MapLegend';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const InteractiveMap = () => {
  const navigate = useNavigate();
  const [activeLayers, setActiveLayers] = useState(['air_quality', 'sensors']);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(true);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [filters, setFilters] = useState({
    timeRange: '24h',
    severity: 'all',
    dataSource: 'all'
  });

  useEffect(() => {
    // Set page title
    document.title = 'Interactive Map - EcoWatch Urban';
  }, []);

  const handleLayerToggle = (layerId, isActive) => {
    if (isActive) {
      setActiveLayers(prev => [...prev, layerId]);
    } else {
      setActiveLayers(prev => prev?.filter(id => id !== layerId));
    }
  };

  const handleLocationSelect = (location) => {
    setSearchLocation(location);
    console.log('Location selected:', location);
  };

  const handleCurrentLocation = async () => {
    // Simulate GPS detection
    return new Promise((resolve) => {
      setTimeout(() => {
        setSearchLocation({
          id: 'current',
          name: 'Current Location',
          lat: 40.7128,
          lng: -74.0060
        });
        resolve();
      }, 2000);
    });
  };

  const handleMarkerClick = (markerData) => {
    setSelectedMarker(markerData);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    console.log('Filters updated:', newFilters);
  };

  const handleViewDetails = () => {
    if (selectedMarker) {
      navigate('/data-analytics', { 
        state: { 
          selectedData: selectedMarker,
          returnPath: '/interactive-map'
        }
      });
    }
  };

  const handleExportData = () => {
    // Simulate data export
    const exportData = {
      layers: activeLayers,
      filters: filters,
      selectedArea: selectedArea,
      timestamp: new Date()?.toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecowatch-map-data-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    document.body?.appendChild(a);
    a?.click();
    document.body?.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReportIssue = () => {
    navigate('/citizen-reporting', {
      state: {
        prefilledLocation: searchLocation,
        returnPath: '/interactive-map'
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AlertNotificationBar />
      <main className="pt-16">
        <div className="h-screen flex">
          {/* Left Sidebar - Controls */}
          <div className={`transition-all duration-300 ${
            isControlPanelOpen ? 'w-80' : 'w-0'
          } overflow-hidden bg-background border-r border-border`}>
            <div className="h-full flex flex-col">
              {/* Search Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Map Controls</h2>
                  <div className="flex items-center space-x-2">
                    <LocationSelector />
                    <UserStatusIndicator />
                  </div>
                </div>
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  onCurrentLocation={handleCurrentLocation}
                />
              </div>

              {/* Layer Controls */}
              <div className="flex-1 overflow-y-auto p-4">
                <LayerControlPanel
                  activeLayers={activeLayers}
                  onLayerToggle={handleLayerToggle}
                  onFilterChange={handleFilterChange}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-border space-y-2">
                <Button
                  variant="default"
                  onClick={handleReportIssue}
                  className="w-full"
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Report Environmental Issue
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportData}
                  >
                    <Icon name="Download" size={14} className="mr-1" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLegendOpen(!isLegendOpen)}
                  >
                    <Icon name="Info" size={14} className="mr-1" />
                    Legend
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Map Area */}
          <div className="flex-1 relative">
            {/* Map Container */}
            <MapContainer
              activeLayers={activeLayers}
              selectedArea={selectedArea}
              onAreaSelect={handleAreaSelect}
              searchLocation={searchLocation}
              onMarkerClick={handleMarkerClick}
            />

            {/* Toggle Control Panel Button */}
            <Button
              variant="default"
              size="icon"
              onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
              className="absolute top-4 left-4 z-10 shadow-lg"
            >
              <Icon name={isControlPanelOpen ? 'ChevronLeft' : 'ChevronRight'} size={16} />
            </Button>

            {/* Map Stats Overlay */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg px-4 py-2 z-10">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span className="text-muted-foreground">Active Sensors: 512</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  <span className="text-muted-foreground">Alerts: 3</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">Reports: 34</span>
                </div>
              </div>
            </div>

            {/* Legend Panel */}
            {isLegendOpen && (
              <div className="absolute bottom-4 right-4 w-80 z-10">
                <MapLegend activeLayers={activeLayers} />
              </div>
            )}

            {/* Quick Actions */}
            <div className="absolute bottom-4 left-4 flex flex-col space-y-2 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/environmental-dashboard')}
                title="Go to Dashboard"
                className="bg-card shadow-lg"
              >
                <Icon name="BarChart3" size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/data-analytics')}
                title="View Analytics"
                className="bg-card shadow-lg"
              >
                <Icon name="TrendingUp" size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.location?.reload()}
                title="Refresh Data"
                className="bg-card shadow-lg"
              >
                <Icon name="RefreshCw" size={16} />
              </Button>
            </div>

            {/* Selected Area Info */}
            {selectedArea && (
              <div className="absolute top-20 right-4 bg-card border border-border rounded-lg shadow-lg p-4 z-10 max-w-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground">Selected Area</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedArea(null)}
                    className="h-6 w-6"
                  >
                    <Icon name="X" size={14} />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Area:</span>
                    <span className="font-medium">2.3 km²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sensors:</span>
                    <span className="font-medium">23 active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg AQI:</span>
                    <span className="font-medium text-warning">Moderate</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/data-analytics', { 
                    state: { selectedArea, returnPath: '/interactive-map' }
                  })}
                  className="w-full mt-3"
                >
                  <Icon name="BarChart3" size={14} className="mr-2" />
                  Analyze Area
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Data Layer Toggle (Mobile) */}
        <DataLayerToggle />

        {/* Data Popup */}
        {selectedMarker && (
          <DataPopup
            data={selectedMarker}
            onClose={() => setSelectedMarker(null)}
            onViewDetails={handleViewDetails}
          />
        )}
      </main>
    </div>
  );
};

export default InteractiveMap;
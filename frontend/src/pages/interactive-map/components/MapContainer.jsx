import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MapContainer = ({ activeLayers, selectedArea, onAreaSelect, searchLocation, onMarkerClick }) => {
  const mapRef = useRef(null);
  // Default to Raipur, Chhattisgarh
  const [mapCenter, setMapCenter] = useState({ lat: 21.2514, lng: 81.6296 });
  const [zoomLevel, setZoomLevel] = useState(13);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);

  // Mock sensor data points around Raipur
  const sensorData = [
    {
      id: 1,
      type: 'air_quality',
      lat: 21.2530,
      lng: 81.6280,
      value: 85,
      status: 'moderate',
      timestamp: new Date(),
      readings: { pm25: 35, pm10: 45, no2: 25, o3: 65 }
    },
    {
      id: 2,
      type: 'noise_levels',
      lat: 21.2490,
      lng: 81.6310,
      value: 72,
      status: 'high',
      timestamp: new Date(),
      readings: { decibels: 72, frequency: 'mixed' }
    },
    {
      id: 3,
      type: 'water_quality',
      lat: 21.2450,
      lng: 81.6340,
      value: 45,
      status: 'poor',
      timestamp: new Date(),
      readings: { ph: 6.2, turbidity: 15, dissolved_oxygen: 4.5 }
    },
    {
      id: 4,
      type: 'temperature',
      lat: 21.2560,
      lng: 81.6260,
      value: 33,
      status: 'normal',
      timestamp: new Date(),
      readings: { celsius: 33.0, humidity: 55, heat_index: 35 }
    }
  ];

  // Mock citizen reports near Raipur
  const citizenReports = [
    {
      id: 1,
      lat: 21.2525,
      lng: 81.6300,
      type: 'litter',
      severity: 'medium',
      description: 'Illegal dumping near market area',
      timestamp: new Date(Date.now() - 3600000),
      status: 'pending'
    },
    {
      id: 2,
      lat: 21.2495,
      lng: 81.6275,
      type: 'air_pollution',
      severity: 'high',
      description: 'Visible smoke from nearby factory',
      timestamp: new Date(Date.now() - 7200000),
      status: 'investigating'
    }
  ];

  useEffect(() => {
    if (searchLocation) {
      // Simulate geocoding and map centering
      setMapCenter({ lat: searchLocation?.lat, lng: searchLocation?.lng });
      setZoomLevel(15);
    }
  }, [searchLocation]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 8));
  };

  const handleDrawingToggle = (mode) => {
    if (drawingMode === mode) {
      setDrawingMode(null);
      setIsDrawing(false);
    } else {
      setDrawingMode(mode);
      setIsDrawing(true);
    }
  };

  const getMarkerColor = (type, status) => {
    const colors = {
      air_quality: { good: '#059669', moderate: '#F4A261', poor: '#DC2626' },
      water_quality: { good: '#4A90A4', moderate: '#D97706', poor: '#DC2626' },
      noise_levels: { low: '#059669', medium: '#F4A261', high: '#DC2626' },
      temperature: { normal: '#4A90A4', high: '#DC2626', low: '#2D5A27' }
    };
    return colors?.[type]?.[status] || '#6B7280';
  };

  const getReportColor = (severity) => {
    const colors = { low: '#059669', medium: '#F4A261', high: '#DC2626' };
    return colors?.[severity] || '#6B7280';
  };

  const renderMarkers = () => {
    const markers = [];

    // Render sensor data markers
    if (activeLayers?.includes('sensors')) {
      sensorData?.forEach(sensor => {
        if (activeLayers?.includes(sensor?.type)) {
          markers?.push(
            <div
              key={`sensor-${sensor?.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${((sensor?.lng - 81.6296) / 0.01) * 100}%`,
                top: `${((21.2514 - sensor?.lat) / 0.01) * 100}%`
              }}
              onClick={() => onMarkerClick(sensor)}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: getMarkerColor(sensor?.type, sensor?.status) }}
              />
            </div>
          );
        }
      });
    }

    // Render citizen report markers
    if (activeLayers?.includes('citizen_reports')) {
      citizenReports?.forEach(report => {
        markers?.push(
          <div
            key={`report-${report?.id}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
              left: `${((report?.lng - 81.6296) / 0.01) * 100}%`,
              top: `${((21.2514 - report?.lat) / 0.01) * 100}%`
            }}
            onClick={() => onMarkerClick(report)}
          >
            <div
              className="w-3 h-3 rotate-45 border-2 border-white shadow-lg"
              style={{ backgroundColor: getReportColor(report?.severity) }}
            />
          </div>
        );
      });
    }

    return markers;
  };

  return (
    <div className="relative w-full h-full bg-muted overflow-hidden">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-full relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E5E7EB' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          cursor: isDrawing ? 'crosshair' : 'grab'
        }}
      >
        {/* Google Maps Iframe */}
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Environmental Data Map"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${mapCenter?.lat},${mapCenter?.lng}&z=${zoomLevel}&output=embed`}
          className="absolute inset-0"
        />

        {/* Data Layer Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Heat Map Overlay for Air Quality */}
          {activeLayers?.includes('air_quality') && (
            <div className="absolute inset-0">
              <div className="absolute top-1/3 left-1/2 w-32 h-32 bg-red-500 opacity-30 rounded-full blur-xl" />
              <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-yellow-500 opacity-25 rounded-full blur-lg" />
              <div className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-green-500 opacity-20 rounded-full blur-md" />
            </div>
          )}

          {/* Noise Level Overlay */}
          {activeLayers?.includes('noise_levels') && (
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-orange-500 opacity-25 rounded-full blur-lg" />
              <div className="absolute bottom-1/3 right-1/2 w-36 h-36 bg-red-600 opacity-20 rounded-full blur-xl" />
            </div>
          )}
        </div>

        {/* Interactive Markers */}
        <div className="absolute inset-0 pointer-events-auto">
          {renderMarkers()}
        </div>

        {/* Selected Area Overlay */}
        {selectedArea && (
          <div 
            className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
            style={{
              left: `${selectedArea?.x}%`,
              top: `${selectedArea?.y}%`,
              width: `${selectedArea?.width}%`,
              height: `${selectedArea?.height}%`
            }}
          />
        )}
      </div>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        {/* Zoom Controls */}
        <div className="bg-card border border-border rounded-lg shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="rounded-b-none border-b border-border"
          >
            <Icon name="Plus" size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="rounded-t-none"
          >
            <Icon name="Minus" size={16} />
          </Button>
        </div>

        {/* Drawing Tools */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-2">
          <div className="flex flex-col space-y-1">
            <Button
              variant={drawingMode === 'rectangle' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => handleDrawingToggle('rectangle')}
              title="Select rectangular area"
            >
              <Icon name="Square" size={16} />
            </Button>
            <Button
              variant={drawingMode === 'circle' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => handleDrawingToggle('circle')}
              title="Select circular area"
            >
              <Icon name="Circle" size={16} />
            </Button>
            <Button
              variant={drawingMode === 'polygon' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => handleDrawingToggle('polygon')}
              title="Select custom area"
            >
              <Icon name="Pentagon" size={16} />
            </Button>
          </div>
        </div>
      </div>
      {/* Map Info */}
      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Icon name="MapPin" size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">
              {mapCenter?.lat?.toFixed(4)}, {mapCenter?.lng?.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="ZoomIn" size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Zoom: {zoomLevel}</span>
          </div>
        </div>
      </div>
      {/* Drawing Mode Indicator */}
      {isDrawing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <Icon name="MousePointer" size={16} />
            <span className="text-sm font-medium">
              Drawing mode: {drawingMode} - Click and drag to select area
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
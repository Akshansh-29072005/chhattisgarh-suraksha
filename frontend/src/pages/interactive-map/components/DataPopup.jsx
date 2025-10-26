import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DataPopup = ({ data, onClose, onViewDetails }) => {
  if (!data) return null;

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp)?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      good: 'text-success',
      normal: 'text-success',
      moderate: 'text-warning',
      poor: 'text-error',
      high: 'text-error',
      low: 'text-success',
      medium: 'text-warning',
      pending: 'text-warning',
      investigating: 'text-error'
    };
    return colors?.[status] || 'text-muted-foreground';
  };

  const getStatusBg = (status) => {
    const colors = {
      good: 'bg-success/10',
      normal: 'bg-success/10',
      moderate: 'bg-warning/10',
      poor: 'bg-error/10',
      high: 'bg-error/10',
      low: 'bg-success/10',
      medium: 'bg-warning/10',
      pending: 'bg-warning/10',
      investigating: 'bg-error/10'
    };
    return colors?.[status] || 'bg-muted/10';
  };

  const renderSensorData = () => {
    const { type, value, status, readings, timestamp } = data;
    
    const getTypeIcon = (type) => {
      const icons = {
        air_quality: 'Wind',
        water_quality: 'Droplets',
        noise_levels: 'Volume2',
        temperature: 'Thermometer'
      };
      return icons?.[type] || 'Radio';
    };

    const getTypeTitle = (type) => {
      const titles = {
        air_quality: 'Air Quality Monitor',
        water_quality: 'Water Quality Sensor',
        noise_levels: 'Noise Level Monitor',
        temperature: 'Temperature Sensor'
      };
      return titles?.[type] || 'Environmental Sensor';
    };

    const renderReadings = () => {
      switch (type) {
        case 'air_quality':
          return (
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="text-xs text-muted-foreground">PM2.5</div>
                <div className="font-medium">{readings?.pm25} μg/m³</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="text-xs text-muted-foreground">PM10</div>
                <div className="font-medium">{readings?.pm10} μg/m³</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="text-xs text-muted-foreground">NO2</div>
                <div className="font-medium">{readings?.no2} ppb</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="text-xs text-muted-foreground">O3</div>
                <div className="font-medium">{readings?.o3} ppb</div>
              </div>
            </div>
          );
        case 'water_quality':
          return (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">pH Level</span>
                <span className="font-medium">{readings?.ph}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Turbidity</span>
                <span className="font-medium">{readings?.turbidity} NTU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dissolved O2</span>
                <span className="font-medium">{readings?.dissolved_oxygen} mg/L</span>
              </div>
            </div>
          );
        case 'noise_levels':
          return (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sound Level</span>
                <span className="font-medium">{readings?.decibels} dB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Frequency</span>
                <span className="font-medium capitalize">{readings?.frequency}</span>
              </div>
            </div>
          );
        case 'temperature':
          return (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Temperature</span>
                <span className="font-medium">{readings?.celsius}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Humidity</span>
                <span className="font-medium">{readings?.humidity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Heat Index</span>
                <span className="font-medium">{readings?.heat_index}°C</span>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
              <Icon name={getTypeIcon(type)} size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{getTypeTitle(type)}</h3>
              <p className="text-sm text-muted-foreground">Sensor ID: {data?.id}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={16} />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground">Current Reading</div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBg(status)} ${getStatusColor(status)}`}>
            {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-foreground mb-2">Detailed Readings</h4>
          {renderReadings()}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Last updated: {formatTimestamp(timestamp)}</span>
          <Icon name="Clock" size={14} />
        </div>
      </div>
    );
  };

  const renderCitizenReport = () => {
    const { type, severity, description, timestamp, status } = data;
    
    const getReportIcon = (type) => {
      const icons = {
        litter: 'Trash2',
        air_pollution: 'Wind',
        water_pollution: 'Droplets',
        noise_complaint: 'Volume2',
        illegal_dumping: 'AlertTriangle'
      };
      return icons?.[type] || 'Flag';
    };

    const getReportTitle = (type) => {
      const titles = {
        litter: 'Litter Report',
        air_pollution: 'Air Pollution Report',
        water_pollution: 'Water Pollution Report',
        noise_complaint: 'Noise Complaint',
        illegal_dumping: 'Illegal Dumping Report'
      };
      return titles?.[type] || 'Citizen Report';
    };

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-warning/10 rounded-full">
              <Icon name={getReportIcon(type)} size={20} className="text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{getReportTitle(type)}</h3>
              <p className="text-sm text-muted-foreground">Report ID: {data?.id}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={16} />
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBg(severity)} ${getStatusColor(severity)}`}>
            {severity?.charAt(0)?.toUpperCase() + severity?.slice(1)} Priority
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBg(status)} ${getStatusColor(status)}`}>
            {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-foreground mb-2">Description</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Reported: {formatTimestamp(timestamp)}</span>
          <Icon name="User" size={14} />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevated max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {data?.type ? renderSensorData() : renderCitizenReport()}
          
          <div className="flex space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={onViewDetails}
              className="flex-1"
            >
              <Icon name="BarChart3" size={16} className="mr-2" />
              View Analytics
            </Button>
            <Button
              variant="default"
              onClick={() => {
                // Navigate to reporting page with pre-filled location
                console.log('Navigate to report issue');
                onClose();
              }}
              className="flex-1"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Report Issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPopup;
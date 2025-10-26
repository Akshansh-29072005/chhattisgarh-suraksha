import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const AlertNotificationBar = () => {
  const [alerts, setAlerts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  // Mock alerts data - in real app, this would come from WebSocket or API
  const mockAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Air Quality Alert',
      message: 'Moderate air pollution detected in Downtown area. Sensitive individuals should limit outdoor activities.',
      timestamp: new Date(),
      location: 'Downtown District',
      severity: 'moderate'
    },
    {
      id: 2,
      type: 'error',
      title: 'Water Quality Emergency',
      message: 'High contamination levels detected in River Park water supply. Avoid contact with water.',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      location: 'River Park',
      severity: 'high'
    },
    {
      id: 3,
      type: 'success',
      title: 'Air Quality Improved',
      message: 'Air quality has returned to good levels in the Industrial Zone.',
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      location: 'Industrial Zone',
      severity: 'low'
    }
  ];

  useEffect(() => {
    // Simulate receiving alerts
    setAlerts(mockAlerts);
    setIsVisible(mockAlerts?.length > 0);
  }, []);

  useEffect(() => {
    if (alerts?.length > 1) {
      const interval = setInterval(() => {
        setCurrentAlertIndex((prev) => (prev + 1) % alerts?.length);
      }, 5000); // Rotate every 5 seconds

      return () => clearInterval(interval);
    }
  }, [alerts?.length]);

  const getAlertStyles = (type) => {
    switch (type) {
      case 'error':
        return 'bg-error text-error-foreground border-error';
      case 'warning':
        return 'bg-warning text-warning-foreground border-warning';
      case 'success':
        return 'bg-success text-success-foreground border-success';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return 'AlertTriangle';
      case 'warning':
        return 'AlertCircle';
      case 'success':
        return 'CheckCircle';
      default:
        return 'Info';
    }
  };

  const dismissAlert = () => {
    setIsVisible(false);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (!isVisible || alerts?.length === 0) {
    return null;
  }

  const currentAlert = alerts?.[currentAlertIndex];

  return (
    <div className={`fixed top-16 left-0 right-0 z-[999] border-b transition-all duration-300 ${getAlertStyles(currentAlert?.type)}`}>
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Icon name={getAlertIcon(currentAlert?.type)} size={20} className="flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-sm truncate">{currentAlert?.title}</h4>
              <span className="text-xs opacity-75 flex-shrink-0">
                {formatTimeAgo(currentAlert?.timestamp)}
              </span>
            </div>
            <p className="text-sm opacity-90 line-clamp-1">{currentAlert?.message}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Icon name="MapPin" size={12} className="opacity-75" />
              <span className="text-xs opacity-75">{currentAlert?.location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {/* Alert Counter */}
          {alerts?.length > 1 && (
            <div className="hidden sm:flex items-center space-x-1 text-xs opacity-75">
              <span>{currentAlertIndex + 1}</span>
              <span>/</span>
              <span>{alerts?.length}</span>
            </div>
          )}

          {/* Navigation Dots */}
          {alerts?.length > 1 && (
            <div className="hidden sm:flex items-center space-x-1">
              {alerts?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentAlertIndex(index)}
                  className={`w-2 h-2 rounded-full transition-opacity duration-300 ${
                    index === currentAlertIndex ? 'opacity-100' : 'opacity-50'
                  } bg-current`}
                  aria-label={`View alert ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={dismissAlert}
            className="h-6 w-6 text-current hover:bg-black/10"
            aria-label="Dismiss alert"
          >
            <Icon name="X" size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertNotificationBar;
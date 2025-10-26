import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import useFilteredAlerts from '../../../hooks/useFilteredAlerts';

const AlertsPanel = ({ alerts: propAlerts = null, loading = false }) => {
  const [filterSeverity, setFilterSeverity] = useState('all');

  // First filter alerts based on user thresholds
  const thresholdFilteredAlerts = useFilteredAlerts(propAlerts);

  // Then process the filtered alerts
  const alerts = Array.isArray(thresholdFilteredAlerts) && thresholdFilteredAlerts.length >= 0
    ? thresholdFilteredAlerts.map(a => ({
        id: a.id || a.timestamp || Math.random(),
        type: a.type || a?.details?.type || 'general',
        severity: a.severity || a?.severity || 'low',
        title: a.message ? (a.type === 'air_quality' ? 'Air Quality Alert' : 'Environmental Alert') : a.title,
        message: a.message || a.details || JSON.stringify(a.details || {}),
        location: a.location_id ? `Location ${a.location_id}` : (a.location || 'Unknown'),
        timestamp: a.timestamp ? new Date(a.timestamp) : new Date(),
        isRead: a.is_read || a.isRead || false,
        value: a.value || a.details?.aqi || a.details?.wqi || a.details?.temperature || a.details?.decibels
      }))
    : [];

  const severityFilters = [
    { value: 'all', label: 'All Alerts', count: alerts?.length },
    { value: 'high', label: 'High', count: alerts?.filter(a => a?.severity === 'high')?.length },
    { value: 'moderate', label: 'Moderate', count: alerts?.filter(a => a?.severity === 'moderate')?.length },
    { value: 'low', label: 'Low', count: alerts?.filter(a => a?.severity === 'low')?.length }
  ];

  const filteredAlerts = filterSeverity === 'all' 
    ? alerts 
    : alerts?.filter(alert => alert?.severity === filterSeverity);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-error bg-error/10 border-error/20';
      case 'moderate':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'low':
        return 'text-success bg-success/10 border-success/20';
      default:
        return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'air_quality':
        return 'Wind';
      case 'noise':
        return 'Volume2';
      case 'temperature':
        return 'Thermometer';
      case 'water':
        return 'Droplets';
      default:
        return 'AlertTriangle';
    }
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

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Real-time Alerts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-3 w-24 bg-muted/20 rounded animate-pulse" />
            <div className="h-3 w-20 bg-muted/20 rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted/20 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-muted/20 w-8 h-8 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-muted/20 rounded w-40 mb-2 animate-pulse" />
                  <div className="h-3 bg-muted/20 rounded w-64 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Real-time Alerts</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              window.location.href = '/user-profile?tab=preferences#alert-thresholds';
            }}
          >
            <Icon name="Settings" size={16} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {severityFilters?.map((filter) => (
            <button
              key={filter?.value}
              onClick={() => setFilterSeverity(filter?.value)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                filterSeverity === filter?.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span>{filter?.label}</span>
              <span className="bg-background/20 px-2 py-0.5 rounded-full text-xs">
                {filter?.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filteredAlerts?.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredAlerts?.map((alert) => (
              <div
                key={alert?.id}
                className={`p-4 transition-colors duration-200 hover:bg-muted/50 ${
                  !alert?.isRead ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert?.severity)}`}>
                    <Icon name={getAlertIcon(alert?.type)} size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-foreground truncate">{alert?.title}</h4>
                      {!alert?.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {alert?.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Icon name="MapPin" size={12} />
                        <span>{alert?.location}</span>
                      </div>
                      <span>{formatTimeAgo(alert?.timestamp)}</span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <Icon name="MoreVertical" size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
            <h4 className="font-medium text-foreground mb-2">No Active Alerts</h4>
            <p className="text-sm text-muted-foreground">
              All environmental conditions are within normal ranges.
            </p>
          </div>
        )}
      </div>
      {filteredAlerts?.length > 0 && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {filteredAlerts?.filter(a => !a?.isRead)?.length} unread alerts
            </span>
            <Button variant="ghost" size="sm">
              Mark all as read
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCardLive = ({ title, value, unit, icon, trend, severity, description, lastUpdated, loading = false }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'good':
        return 'text-success border-success/20 bg-success/5';
      case 'moderate':
        return 'text-warning border-warning/20 bg-warning/5';
      case 'unhealthy':
        return 'text-error border-error/20 bg-error/5';
      case 'hazardous':
        return 'text-destructive border-destructive/20 bg-destructive/5';
      default:
        return 'text-muted-foreground border-border bg-muted/5';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return 'TrendingUp';
    if (trend < 0) return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-error';
    if (trend < 0) return 'text-success';
    return 'text-muted-foreground';
  };

  // Loading skeleton or no data
  if (loading || !value || value === '—' || value === 'undefined' || value === 'null') {
    const isLoading = loading;
    return (
      <div className={`p-6 rounded-lg border-2 transition-all duration-300 hover:shadow-md ${
        isLoading ? 'border-muted' : getSeverityColor(severity)
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isLoading ? 'bg-muted/20 animate-pulse' : 'bg-muted/50'} w-10 h-10`}>
              <Icon name={icon} size={24} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Loading...' : 'No data available'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-baseline space-x-2 mb-3">
          <span className="text-3xl font-bold text-foreground opacity-50">—</span>
          <span className="text-lg text-muted-foreground">{unit}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{isLoading ? 'Updating...' : 'No data'}</span>
          <span>{lastUpdated || 'Never'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border-2 transition-all duration-300 hover:shadow-md ${getSeverityColor(severity)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-background/50">
            <Icon name={icon} size={24} className="text-current" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name={getTrendIcon(trend)} size={16} className={getTrendColor(trend)} />
          <span className={`text-sm font-medium ${getTrendColor(trend)}`}>{Math.abs(trend)}%</span>
        </div>
      </div>

      <div className="flex items-baseline space-x-2 mb-3">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span className="text-lg text-muted-foreground">{unit}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="capitalize">{severity} level</span>
        <span>Updated {lastUpdated}</span>
      </div>
    </div>
  );
};

export { MetricsCardLive as default };
export const MetricsCard = MetricsCardLive;

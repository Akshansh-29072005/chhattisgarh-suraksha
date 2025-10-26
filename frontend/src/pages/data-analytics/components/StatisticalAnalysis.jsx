import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const StatisticalAnalysis = () => {
  const [selectedAnalysis, setSelectedAnalysis] = useState('trends');
  const [selectedMetric, setSelectedMetric] = useState('pm25');

  const analysisTypes = [
    { value: 'trends', label: 'Trend Analysis' },
    { value: 'correlation', label: 'Correlation Matrix' },
    { value: 'anomaly', label: 'Anomaly Detection' },
    { value: 'comparison', label: 'Regional Comparison' }
  ];

  const metricOptions = [
    { value: 'pm25', label: 'PM2.5' },
    { value: 'pm10', label: 'PM10' },
    { value: 'no2', label: 'NO2' },
    { value: 'so2', label: 'SO2' },
    { value: 'co', label: 'CO' },
    { value: 'o3', label: 'O3' }
  ];

  // Mock statistical data
  const trendData = {
    pm25: {
      current: 78,
      change: -12.5,
      trend: 'decreasing',
      confidence: 0.85,
      forecast: [82, 79, 76, 73, 70],
      seasonality: 'High correlation with winter months'
    }
  };

  const correlationMatrix = [
    { metric1: 'PM2.5', metric2: 'PM10', correlation: 0.89, strength: 'Strong' },
    { metric1: 'PM2.5', metric2: 'NO2', correlation: 0.72, strength: 'Moderate' },
    { metric1: 'PM2.5', metric2: 'Temperature', correlation: -0.45, strength: 'Weak' },
    { metric1: 'NO2', metric2: 'CO', correlation: 0.68, strength: 'Moderate' },
    { metric1: 'O3', metric2: 'Temperature', correlation: 0.56, strength: 'Moderate' }
  ];

  const anomalies = [
    {
      id: 1,
      timestamp: '2025-10-07 08:30:00',
      location: 'Industrial Zone',
      metric: 'PM2.5',
      value: 245,
      expected: 85,
      severity: 'High',
      confidence: 0.92
    },
    {
      id: 2,
      timestamp: '2025-10-06 14:15:00',
      location: 'Downtown District',
      metric: 'NO2',
      value: 125,
      expected: 45,
      severity: 'Medium',
      confidence: 0.78
    }
  ];

  const regionalComparison = [
    { region: 'Downtown District', pm25: 78, rank: 3, change: -5.2 },
    { region: 'Industrial Zone', pm25: 142, rank: 1, change: +8.7 },
    { region: 'River Park', pm25: 45, rank: 5, change: -2.1 },
    { region: 'Residential North', pm25: 52, rank: 4, change: -1.8 },
    { region: 'Harbor District', pm25: 95, rank: 2, change: +3.4 }
  ];

  const getCorrelationColor = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'text-success';
    if (abs >= 0.4) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'text-error bg-error/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      case 'low':
        return 'text-success bg-success/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const renderTrendAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Current Value</div>
          <div className="text-2xl font-bold text-foreground">{trendData?.pm25?.current} μg/m³</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">7-Day Change</div>
          <div className={`text-2xl font-bold ${trendData?.pm25?.change < 0 ? 'text-success' : 'text-error'}`}>
            {trendData?.pm25?.change > 0 ? '+' : ''}{trendData?.pm25?.change}%
          </div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Confidence</div>
          <div className="text-2xl font-bold text-foreground">{(trendData?.pm25?.confidence * 100)?.toFixed(0)}%</div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-3">5-Day Forecast</h4>
        <div className="flex items-end space-x-2 h-20">
          {trendData?.pm25?.forecast?.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-primary rounded-t"
                style={{ height: `${(value / Math.max(...trendData?.pm25?.forecast)) * 100}%` }}
              />
              <div className="text-xs text-muted-foreground mt-1">{value}</div>
              <div className="text-xs text-muted-foreground">Day {index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-2">Seasonality Analysis</h4>
        <p className="text-sm text-muted-foreground">{trendData?.pm25?.seasonality}</p>
      </div>
    </div>
  );

  const renderCorrelationMatrix = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Correlation coefficients between environmental metrics (-1 to +1)
      </div>
      <div className="space-y-2">
        {correlationMatrix?.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-sm font-medium text-foreground">
                {item?.metric1} ↔ {item?.metric2}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full bg-muted ${getCorrelationColor(item?.correlation)}`}>
                {item?.strength}
              </span>
            </div>
            <div className={`text-lg font-bold ${getCorrelationColor(item?.correlation)}`}>
              {item?.correlation > 0 ? '+' : ''}{item?.correlation?.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnomalyDetection = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Detected anomalies in environmental data using statistical models
      </div>
      <div className="space-y-3">
        {anomalies?.map((anomaly) => (
          <div key={anomaly?.id} className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-medium text-foreground">{anomaly?.location}</div>
                <div className="text-sm text-muted-foreground">{anomaly?.timestamp}</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly?.severity)}`}>
                {anomaly?.severity} Risk
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Metric</div>
                <div className="font-medium text-foreground">{anomaly?.metric}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Observed</div>
                <div className="font-medium text-error">{anomaly?.value}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Expected</div>
                <div className="font-medium text-foreground">{anomaly?.expected}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Confidence</div>
                <div className="font-medium text-foreground">{(anomaly?.confidence * 100)?.toFixed(0)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRegionalComparison = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Comparative analysis of PM2.5 levels across different regions
      </div>
      <div className="space-y-2">
        {regionalComparison?.map((region, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                region?.rank === 1 ? 'bg-error text-white' : 
                region?.rank === 2 ? 'bg-warning text-white': 'bg-success text-white'
              }`}>
                {region?.rank}
              </div>
              <div className="text-sm font-medium text-foreground">{region?.region}</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-lg font-bold text-foreground">{region?.pm25} μg/m³</div>
              <div className={`text-sm font-medium ${region?.change > 0 ? 'text-error' : 'text-success'}`}>
                {region?.change > 0 ? '+' : ''}{region?.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalysisContent = () => {
    switch (selectedAnalysis) {
      case 'correlation':
        return renderCorrelationMatrix();
      case 'anomaly':
        return renderAnomalyDetection();
      case 'comparison':
        return renderRegionalComparison();
      default:
        return renderTrendAnalysis();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Statistical Analysis</h3>
          <p className="text-sm text-muted-foreground">Advanced statistical insights and patterns</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            options={analysisTypes}
            value={selectedAnalysis}
            onChange={setSelectedAnalysis}
            className="min-w-40"
          />

          {selectedAnalysis === 'trends' && (
            <Select
              options={metricOptions}
              value={selectedMetric}
              onChange={setSelectedMetric}
              className="min-w-32"
            />
          )}

          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            size="sm"
          >
            Export Report
          </Button>
        </div>
      </div>

      {renderAnalysisContent()}
    </div>
  );
};

export default StatisticalAnalysis;
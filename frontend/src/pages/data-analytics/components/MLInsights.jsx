import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const MLInsights = () => {
  const [selectedModel, setSelectedModel] = useState('pollution_hotspots');

  const modelOptions = [
    { value: 'pollution_hotspots', label: 'Pollution Hotspot Prediction' },
    { value: 'air_quality_forecast', label: 'Air Quality Forecasting' },
    { value: 'risk_assessment', label: 'Health Risk Assessment' },
    { value: 'pattern_recognition', label: 'Pattern Recognition' }
  ];

  // Mock ML model results
  const hotspotPredictions = [
    {
      id: 1,
      location: 'Industrial Zone East',
      coordinates: [40.6892, -74.0445],
      riskScore: 0.89,
      confidence: 0.92,
      predictedPeak: '2025-10-08 09:00:00',
      factors: ['Heavy traffic', 'Industrial emissions', 'Weather conditions'],
      severity: 'High'
    },
    {
      id: 2,
      location: 'Downtown Intersection',
      coordinates: [40.7128, -74.0060],
      riskScore: 0.74,
      confidence: 0.85,
      predictedPeak: '2025-10-08 17:30:00',
      factors: ['Rush hour traffic', 'Construction activity'],
      severity: 'Medium'
    },
    {
      id: 3,
      location: 'Harbor District',
      coordinates: [40.7074, -74.0113],
      riskScore: 0.61,
      confidence: 0.78,
      predictedPeak: '2025-10-08 12:15:00',
      factors: ['Ship emissions', 'Wind patterns'],
      severity: 'Medium'
    }
  ];

  const forecastData = {
    model: 'LSTM Neural Network',
    accuracy: 0.87,
    lastTrained: '2025-10-06 22:00:00',
    predictions: [
      { time: '06:00', pm25: 65, confidence: 0.89 },
      { time: '12:00', pm25: 89, confidence: 0.92 },
      { time: '18:00', pm25: 112, confidence: 0.85 },
      { time: '24:00', pm25: 78, confidence: 0.88 }
    ]
  };

  const riskAssessment = {
    overallRisk: 'Moderate',
    healthScore: 72,
    vulnerablePopulation: 15420,
    recommendations: [
      'Limit outdoor activities during peak hours (8-10 AM, 5-7 PM)',
      'Use air purifiers in indoor spaces',
      'Wear N95 masks when outdoors in high-risk areas',
      'Monitor air quality alerts regularly'
    ]
  };

  const patternInsights = [
    {
      pattern: 'Weekly Cycle',
      description: 'PM2.5 levels consistently peak on weekdays (Mon-Fri) due to increased traffic and industrial activity',
      confidence: 0.94,
      impact: 'High'
    },
    {
      pattern: 'Weather Correlation',
      description: 'Strong negative correlation (-0.72) between wind speed and pollution concentration',
      confidence: 0.88,
      impact: 'High'
    },
    {
      pattern: 'Seasonal Variation',
      description: 'Winter months show 35% higher pollution levels due to heating systems and atmospheric conditions',
      confidence: 0.91,
      impact: 'Medium'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'text-error bg-error/10 border-error/20';
      case 'medium':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'low':
        return 'text-success bg-success/10 border-success/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 0.8) return 'text-error';
    if (score >= 0.6) return 'text-warning';
    return 'text-success';
  };

  const renderHotspotPredictions = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Active Hotspots</div>
          <div className="text-2xl font-bold text-foreground">{hotspotPredictions?.length}</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Avg Confidence</div>
          <div className="text-2xl font-bold text-foreground">
            {(hotspotPredictions?.reduce((acc, h) => acc + h?.confidence, 0) / hotspotPredictions?.length * 100)?.toFixed(0)}%
          </div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">High Risk Areas</div>
          <div className="text-2xl font-bold text-error">
            {hotspotPredictions?.filter(h => h?.riskScore >= 0.8)?.length}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {hotspotPredictions?.map((hotspot) => (
          <div key={hotspot?.id} className="border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-foreground">{hotspot?.location}</h4>
                <div className="text-sm text-muted-foreground">
                  Peak predicted: {hotspot?.predictedPeak}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(hotspot?.severity)}`}>
                {hotspot?.severity} Risk
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-sm text-muted-foreground">Risk Score</div>
                <div className={`text-lg font-bold ${getRiskScoreColor(hotspot?.riskScore)}`}>
                  {(hotspot?.riskScore * 100)?.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Confidence</div>
                <div className="text-lg font-bold text-foreground">
                  {(hotspot?.confidence * 100)?.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Coordinates</div>
                <div className="text-sm font-mono text-foreground">
                  {hotspot?.coordinates?.[0]?.toFixed(4)}, {hotspot?.coordinates?.[1]?.toFixed(4)}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">Contributing Factors</div>
              <div className="flex flex-wrap gap-1">
                {hotspot?.factors?.map((factor, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAirQualityForecast = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Model Accuracy</div>
          <div className="text-2xl font-bold text-foreground">{(forecastData?.accuracy * 100)?.toFixed(0)}%</div>
          <div className="text-xs text-muted-foreground mt-1">{forecastData?.model}</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Last Training</div>
          <div className="text-sm font-medium text-foreground">{forecastData?.lastTrained}</div>
          <div className="text-xs text-success mt-1">Model up to date</div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-4">24-Hour Forecast</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {forecastData?.predictions?.map((pred, index) => (
            <div key={index} className="text-center">
              <div className="text-sm text-muted-foreground mb-1">{pred?.time}</div>
              <div className="text-xl font-bold text-foreground mb-1">{pred?.pm25}</div>
              <div className="text-xs text-muted-foreground">μg/m³</div>
              <div className="text-xs text-success mt-1">
                {(pred?.confidence * 100)?.toFixed(0)}% confidence
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRiskAssessment = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Overall Risk</div>
          <div className={`text-2xl font-bold ${
            riskAssessment?.overallRisk === 'High' ? 'text-error' :
            riskAssessment?.overallRisk === 'Moderate' ? 'text-warning' : 'text-success'
          }`}>
            {riskAssessment?.overallRisk}
          </div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Health Score</div>
          <div className="text-2xl font-bold text-foreground">{riskAssessment?.healthScore}/100</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Vulnerable Population</div>
          <div className="text-2xl font-bold text-foreground">
            {riskAssessment?.vulnerablePopulation?.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-3">Health Recommendations</h4>
        <div className="space-y-2">
          {riskAssessment?.recommendations?.map((rec, index) => (
            <div key={index} className="flex items-start space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPatternRecognition = () => (
    <div className="space-y-4">
      {patternInsights?.map((pattern, index) => (
        <div key={index} className="border border-border rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-medium text-foreground">{pattern?.pattern}</h4>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                pattern?.impact === 'High' ? 'bg-error/10 text-error' :
                pattern?.impact === 'Medium'? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
              }`}>
                {pattern?.impact} Impact
              </span>
              <span className="text-sm text-muted-foreground">
                {(pattern?.confidence * 100)?.toFixed(0)}% confidence
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{pattern?.description}</p>
        </div>
      ))}
    </div>
  );

  const renderModelContent = () => {
    switch (selectedModel) {
      case 'air_quality_forecast':
        return renderAirQualityForecast();
      case 'risk_assessment':
        return renderRiskAssessment();
      case 'pattern_recognition':
        return renderPatternRecognition();
      default:
        return renderHotspotPredictions();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Machine Learning Insights</h3>
          <p className="text-sm text-muted-foreground">AI-powered predictions and pattern analysis</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            options={modelOptions}
            value={selectedModel}
            onChange={setSelectedModel}
            className="min-w-48"
          />

          <Button
            variant="outline"
            iconName="RefreshCw"
            iconPosition="left"
            size="sm"
          >
            Retrain Model
          </Button>

          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            size="sm"
          >
            Export Results
          </Button>
        </div>
      </div>

      {renderModelContent()}

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Model Status: Active</span>
            <span>Last Update: 2 hours ago</span>
          </div>
          <Button variant="ghost" size="sm" iconName="Info">
            Model Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MLInsights;
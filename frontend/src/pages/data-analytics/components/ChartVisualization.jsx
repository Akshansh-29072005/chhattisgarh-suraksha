import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ChartVisualization = ({ data, title, onChartTypeChange }) => {
  const [chartType, setChartType] = useState('line');
  const [selectedMetrics, setSelectedMetrics] = useState(['aqi', 'temperature']);

  // Use incoming data or create a data point from current metrics
  const formatMetricsData = (data) => {
    if (!data) return [];
    return [{
      time: new Date(data.last_updated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      pm25: data.pm25,
      pm10: data.pm10,
      aqi: data.aqi,
      temperature: data.temperature,
      humidity: data.humidity
    }];
  };

  const metricsData = formatMetricsData(data);

  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'bar', label: 'Bar Chart' },
    { value: 'scatter', label: 'Scatter Plot' }
  ];

  const metricOptions = [
    { value: 'aqi', label: 'Air Quality', color: '#059669' },
    { value: 'pm25', label: 'PM2.5', color: '#DC2626' },
    { value: 'pm10', label: 'PM10', color: '#D97706' },
    { value: 'temperature', label: 'Temperature', color: '#F4A261' },
    { value: 'humidity', label: 'Humidity', color: '#3B82F6' }
  ];

  const handleChartTypeChange = (type) => {
    setChartType(type);
    onChartTypeChange(type);
  };

  const handleMetricToggle = (metric) => {
    setSelectedMetrics(prev => 
      prev?.includes(metric)
        ? prev?.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const getMetricColor = (metric) => {
    const metricConfig = metricOptions?.find(m => m?.value === metric);
    return metricConfig ? metricConfig?.color : '#6B7280';
  };

  const renderChart = () => {
    const commonProps = {
      data: metricsData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="time" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            {selectedMetrics?.map((metric) => (
              <Area
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={getMetricColor(metric)}
                fill={getMetricColor(metric)}
                fillOpacity={0.3}
                name={metricOptions?.find(m => m?.value === metric)?.label}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="time" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            {selectedMetrics?.map((metric) => (
              <Bar
                key={metric}
                dataKey={metric}
                fill={getMetricColor(metric)}
                name={metricOptions?.find(m => m?.value === metric)?.label}
              />
            ))}
          </BarChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="pm25" stroke="#6B7280" name="PM2.5" />
            <YAxis dataKey="temperature" stroke="#6B7280" name="Temperature" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }} 
            />
            <Scatter name="PM2.5 vs Temperature" data={metricsData} fill="#059669" />
          </ScatterChart>
        );

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="time" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }} 
            />
            <Legend />
            {selectedMetrics?.map((metric) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={getMetricColor(metric)}
                strokeWidth={2}
                dot={{ fill: getMetricColor(metric), strokeWidth: 2, r: 4 }}
                name={metricOptions?.find(m => m?.value === metric)?.label}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">Interactive environmental data visualization</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            options={chartTypeOptions}
            value={chartType}
            onChange={handleChartTypeChange}
            className="min-w-32"
          />
          
          <Button
            variant="outline"
            iconName="Download"
            iconPosition="left"
            size="sm"
          >
            Export
          </Button>

          <Button
            variant="outline"
            iconName="Maximize2"
            iconPosition="left"
            size="sm"
          >
            Fullscreen
          </Button>
        </div>
      </div>
      {/* Metric Selection */}
      <div className="mb-4">
        <div className="text-sm font-medium text-foreground mb-2">Select Metrics:</div>
        <div className="flex flex-wrap gap-2">
          {metricOptions?.map((metric) => (
            <button
              key={metric?.value}
              onClick={() => handleMetricToggle(metric?.value)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedMetrics?.includes(metric?.value)
                  ? 'border-transparent text-white' :'border-border text-muted-foreground hover:text-foreground'
              }`}
              style={{
                backgroundColor: selectedMetrics?.includes(metric?.value) ? metric?.color : 'transparent'
              }}
            >
              {metric?.label}
            </button>
          ))}
        </div>
      </div>
      {/* Chart Container */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      {/* Chart Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {data?.aqi ?? '—'}
          </div>
          <div className="text-xs text-muted-foreground">Current AQI</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {data?.temperature ? `${data.temperature}°C` : '—'}
          </div>
          <div className="text-xs text-muted-foreground">Temperature</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {data?.humidity ? `${data.humidity}%` : '—'}
          </div>
          <div className="text-xs text-muted-foreground">Humidity</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {data?.last_updated ? new Date(data.last_updated).toLocaleTimeString() : '—'}
          </div>
          <div className="text-xs text-muted-foreground">Last Updated</div>
        </div>
      </div>
    </div>
  );
};

export default ChartVisualization;
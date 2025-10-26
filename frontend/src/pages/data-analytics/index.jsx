import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import AlertNotificationBar from '../../components/ui/AlertNotificationBar';
import LocationSelector from '../../components/ui/LocationSelector';
import UserStatusIndicator from '../../components/ui/UserStatusIndicator';
import DataLayerToggle from '../../components/ui/DataLayerToggle';
import AnalyticsHeader from './components/AnalyticsHeader';
import FilterPanel from './components/FilterPanel';
import ChartVisualization from './components/ChartVisualization';
import DataTable from './components/DataTable';
import StatisticalAnalysis from './components/StatisticalAnalysis';
import MLInsights from './components/MLInsights';
import ReportGenerator from './components/ReportGenerator';

const DataAnalytics = () => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedDataType, setSelectedDataType] = useState('all');

  const handleTimeRangeChange = (timeRange) => {
    setSelectedTimeRange(timeRange);
    console.log('Time range changed:', timeRange);
  };

  const handleDataTypeChange = (dataType) => {
    setSelectedDataType(dataType);
    console.log('Data type changed:', dataType);
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    console.log('Filters applied:', filters);
  };

  const handleExportData = () => {
    console.log('Exporting data with current filters and selections');
    // Simulate export functionality
    alert('Data export initiated. You will receive a download link shortly.');
  };

  const handleChartTypeChange = (chartType) => {
    console.log('Chart type changed:', chartType);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AlertNotificationBar />
      
      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
        onApplyFilters={handleApplyFilters}
      />

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${isFilterPanelOpen ? 'ml-80' : 'ml-0'}`}>
        {/* Analytics Header */}
        <AnalyticsHeader
          onTimeRangeChange={handleTimeRangeChange}
          onDataTypeChange={handleDataTypeChange}
          onExportData={handleExportData}
        />

        {/* Secondary Header with Location and User Status */}
        <div className="bg-card border-b border-border px-6 py-3">
          <div className="flex items-center justify-between">
            <LocationSelector />
            <UserStatusIndicator />
          </div>
        </div>

        {/* Analytics Content */}
        <div className="p-6 space-y-6">
          {/* Primary Visualization */}
          <ChartVisualization
            title="Environmental Data Trends"
            data={{
              timeRange: selectedTimeRange,
              dataType: selectedDataType,
              filters: activeFilters
            }}
            onChartTypeChange={handleChartTypeChange}
          />

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <StatisticalAnalysis />
            <MLInsights />
          </div>

          {/* Data Table */}
          <DataTable onExportData={handleExportData} />

          {/* Report Generator */}
          <ReportGenerator />
        </div>
      </main>

      {/* Data Layer Toggle */}
      <DataLayerToggle />
    </div>
  );
};

export default DataAnalytics;
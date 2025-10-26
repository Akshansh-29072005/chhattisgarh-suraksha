import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import Header from '../../components/ui/Header';
import AlertNotificationBar from '../../components/ui/AlertNotificationBar';
import LocationSelector from '../../components/ui/LocationSelector';
import UserStatusIndicator from '../../components/ui/UserStatusIndicator';
import DataLayerToggle from '../../components/ui/DataLayerToggle';
import ErrorBoundary from '../../components/ErrorBoundary';
import { MetricsCard, MetricsCardLive } from './components/MetricsCardLive.jsx';
import MapWidget from './components/MapWidget';
import AlertsWidget from './components/AlertsPanel';
import RecommendationsSection from './components/RecommendationsSection';
import QuickActions from './components/QuickActions';
import CommunityStats from './components/CommunityStats';
import ChartWidget from './components/ChartWidget';
import AchievementsPanel from './components/AchievementsPanel';
import useEnvironmentalData from '../../hooks/useEnvironmentalData';
import { formatDistanceToNow } from 'date-fns';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const EnvironmentalDashboard = () => {
  const { metrics, alerts, trends, loading, error, refetch } = useEnvironmentalData();
  
  // Debug logging
  console.log('[Dashboard] State:', {
    metrics: metrics || 'no metrics',
    loading,
    error: error || 'no error',
    alerts: alerts?.length || 0
  });
  const [dataError, setDataError] = useState(null);

  // Effect to handle errors
  useEffect(() => {
    if (error && !loading) {
      // Only set error if it's a critical error
      if (typeof error === 'object' && error.critical) {
        setDataError(error.message);
      } else if (typeof error === 'string' && error.includes('Unable to load')) {
        setDataError(error);
      } else {
        // For non-critical errors, just show a toast
        toast.error(error);
      }
    } else {
      setDataError(null);
    }
  }, [error, loading]);

  // Loading state with skeleton UI that maintains layout
  const renderLoadingState = () => (
    <div className="min-h-screen bg-background pt-16">
      <Header />
      <AlertNotificationBar />
      
      {/* Location and User Status Bar */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <LocationSelector />
            <Button 
              variant="outline" 
              size="sm" 
              disabled={true}
            >
              <Icon name="Loader2" size={16} className="animate-spin" />
              <span className="ml-2">Loading...</span>
            </Button>
          </div>
          <UserStatusIndicator />
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-4 lg:p-6 space-y-6">
        {/* Environmental Metrics Grid */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Real-time Environmental Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { title: 'Air Quality Index', icon: 'Wind' },
              { title: 'Temperature', icon: 'Thermometer' },
              { title: 'Humidity', icon: 'Droplets' },
              { title: 'PM2.5', icon: 'Activity' }
            ].map((metric, index) => (
              <MetricsCard
                key={index}
                title={metric.title}
                value="—"
                unit=""
                icon={metric.icon}
                trend={0}
                severity="neutral"
                description="Loading data..."
                lastUpdated="updating..."
                loading={true}
              />
            ))}
          </div>
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="h-64 bg-card border border-border rounded-lg animate-pulse"></div>
            <div className="h-64 bg-card border border-border rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-card border border-border rounded-lg animate-pulse"></div>
            <div className="h-48 bg-card border border-border rounded-lg animate-pulse"></div>
            <div className="h-48 bg-card border border-border rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Handle error state
  if (dataError) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Header />
        <AlertNotificationBar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-error/5 border border-error/20 rounded-lg p-6 text-center">
            <Icon name="AlertTriangle" size={48} className="text-error mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-error mb-2">Unable to Load Dashboard</h2>
            <p className="text-muted-foreground mb-4">{dataError}</p>
            <Button
              variant="outline"
              onClick={() => {
                setDataError(null);
                refetch();
              }}
              className="border-error text-error hover:bg-error hover:text-error-foreground"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state for initial data fetch
  if (loading && !metrics) {
    return renderLoadingState();
  }

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  const formatLastUpdated = (iso) => {
    try {
      return formatDistanceToNow(new Date(iso), { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  };

  // Map backend metrics to card-friendly format with fallback values
  const environmentalMetrics = React.useMemo(() => {
    // If no metrics data, return loading placeholders
    if (!metrics) {
      return [{
        title: 'Air Quality Index',
        value: '—',
        unit: 'AQI',
        icon: 'Wind',
        trend: 0,
        severity: 'neutral',
        description: 'Loading...',
        lastUpdated: 'updating...'
      }, {
        title: 'Temperature',
        value: '—',
        unit: '°C',
        icon: 'Thermometer',
        trend: 0,
        severity: 'neutral',
        description: 'Loading...',
        lastUpdated: 'updating...'
      }, {
        title: 'Humidity',
        value: '—',
        unit: '%',
        icon: 'Droplets',
        trend: 0,
        severity: 'neutral',
        description: 'Loading...',
        lastUpdated: 'updating...'
      }, {
        title: 'PM2.5',
        value: '—',
        unit: 'µg/m³',
        icon: 'Activity',
        trend: 0,
        severity: 'neutral',
        description: 'Loading...',
        lastUpdated: 'updating...'
      }];
    }

    // Return actual metrics if available
    return [{
      title: 'Air Quality Index',
      value: (metrics?.aqi != null) ? Number(metrics.aqi).toFixed(0) : '—',
      unit: 'AQI',
      icon: 'Wind',
      trend: 0,
      severity: (metrics?.aqi >= 0 && metrics?.aqi <= 50) ? 'good' : (metrics?.aqi <= 100 ? 'moderate' : (metrics?.aqi <= 200 ? 'unhealthy' : 'hazardous')),
      description: `PM2.5 ${metrics?.pm25 != null ? Number(metrics.pm25).toFixed(2) : '—'} µg/m³ • PM10 ${metrics?.pm10 != null ? Number(metrics.pm10).toFixed(2) : '—'} µg/m³`,
      lastUpdated: metrics?.last_updated ? formatLastUpdated(metrics.last_updated) : 'just now'
    }, {
      title: 'Temperature',
      value: metrics?.temperature != null ? Number(metrics.temperature).toFixed(1) : '—',
      unit: '°C',
      icon: 'Thermometer',
      trend: 0,
      severity: (metrics?.temperature && metrics?.temperature > 40) ? 'unhealthy' : 'good',
      description: 'Ambient temperature',
      lastUpdated: metrics?.last_updated ? formatLastUpdated(metrics.last_updated) : 'just now'
    }, {
      title: 'Humidity',
      value: metrics?.humidity != null ? Number(metrics.humidity).toFixed(0) : '—',
      unit: '%',
      icon: 'Droplets',
      trend: 0,
      severity: 'good',
      description: 'Relative humidity',
      lastUpdated: metrics?.last_updated ? formatLastUpdated(metrics.last_updated) : 'just now'
    }, {
      title: 'PM2.5',
      value: metrics?.pm25 != null ? Number(metrics.pm25).toFixed(2) : '—',
      unit: 'µg/m³',
      icon: 'Activity',
      trend: 0,
      severity: (metrics?.pm25 && metrics?.pm25 > 60) ? 'unhealthy' : 'moderate',
      description: 'Fine particulate matter',
      lastUpdated: metrics?.last_updated ? formatLastUpdated(metrics.last_updated) : 'just now'
    }];
  }, [metrics, formatLastUpdated]);

  return (
    <>
      <Helmet>
        <title>Environmental Dashboard - EcoWatch Urban</title>
        <meta name="description" content="Real-time environmental monitoring dashboard with air quality, noise levels, temperature data, and personalized sustainability recommendations." />
      </Helmet>
  <div className="min-h-screen bg-background pt-16">
        <Header />
        <AlertNotificationBar />
        
        {/* Location and User Status Bar */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <LocationSelector />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
              >
                <Icon name="RefreshCcw" size={16} className={loading ? 'animate-spin' : ''} />
                <span className="ml-2">{loading ? 'Refreshing...' : 'Refresh Data'}</span>
              </Button>
            </div>
            <UserStatusIndicator />
          </div>
        </div>

          {/* Dashboard Content */}
          <div className="p-4 lg:p-6 space-y-6">
              {/* Environmental Metrics Grid */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Real-time Environmental Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {React.useMemo(() => (
                  environmentalMetrics?.map((metric, index) => (
                    <MetricsCard
                      key={`metric-${index}`}
                      title={metric?.title || 'Loading...'}
                      value={metric?.value || '—'}
                      unit={metric?.unit || ''}
                      icon={metric?.icon || 'Loader'}
                      trend={metric?.trend || 0}
                      severity={metric?.severity || 'neutral'}
                      description={metric?.description || 'Loading...'}
                      lastUpdated={metric?.lastUpdated || 'updating...'}
                      loading={loading}
                    />
                  ))
                ), [environmentalMetrics, loading])}
              </div>
            </section>            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Map and Charts */}
              <div className="xl:col-span-2 space-y-6">
                <React.Suspense fallback={
                  <div className="h-64 bg-card border border-border rounded-lg animate-pulse" />
                }>
                  <MapWidget metrics={metrics} loading={loading} alerts={alerts} />
                </React.Suspense>
                <React.Suspense fallback={
                  <div className="h-64 bg-card border border-border rounded-lg animate-pulse" />
                }>
                  <ChartWidget metrics={metrics} trends={trends} loading={loading} />
                </React.Suspense>
              </div>

              {/* Right Column - Live Metrics */}
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 xl:grid-cols-1 gap-6">
                  {environmentalMetrics.map((metric, index) => (
                    <React.Suspense key={`live-metric-${index}`} fallback={
                      <div className="h-32 bg-card border border-border rounded-lg animate-pulse" />
                    }>
                      <ErrorBoundary fallback={
                        <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">
                          Failed to load metric
                        </div>
                      }>
                        <MetricsCardLive {...metric} />
                      </ErrorBoundary>
                    </React.Suspense>
                  ))}
                </div>
                <React.Suspense fallback={
                  <div className="h-64 bg-card border border-border rounded-lg animate-pulse" />
                }>
                  <AlertsWidget alerts={alerts} loading={loading} />
                </React.Suspense>
              </div>
            </div>

            {/* Quick Actions */}
            <section>
              <QuickActions />
            </section>

            {/* Community Statistics */}
            <section>
              <CommunityStats />
            </section>
          </div>

        {/* Data Layer Toggle (Fixed Position) */}
        <DataLayerToggle />
      </div>
    </>
  );
};

// Error boundary HOC
const withErrorBoundary = (WrappedComponent) => {
  return class extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, info) {
      console.error('Dashboard Error:', error, info);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="min-h-screen bg-background pt-16">
            <Header />
            <div className="container mx-auto px-4 py-8">
              <div className="bg-error/5 border border-error/20 rounded-lg p-6 text-center">
                <Icon name="AlertTriangle" size={48} className="text-error mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-error mb-2">Dashboard Error</h2>
                <p className="text-muted-foreground mb-4">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-error text-error hover:bg-error hover:text-error-foreground"
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  };
};

export default withErrorBoundary(EnvironmentalDashboard);
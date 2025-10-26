import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const NearbyReports = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const nearbyReports = [
    {
      id: 'RPT001',
      type: 'air_pollution',
      title: 'Industrial Smoke Emission',
      location: '2 blocks away • Industrial Zone',
      distance: 0.3,
      severity: 'high',
      status: 'investigating',
      reportedBy: 'Michael Rodriguez',
      reportedAt: new Date(Date.now() - 3600000), // 1 hour ago
      description: 'Heavy black smoke coming from factory chimney, strong chemical odor in the area.',
      photos: ['https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=300&h=200&fit=crop'],
      upvotes: 12,
      comments: 3
    },
    {
      id: 'RPT002',
      type: 'litter_waste',
      title: 'Illegal Dumping Site',
      location: '0.5 miles away • River Park',
      distance: 0.5,
      severity: 'moderate',
      status: 'reported',
      reportedBy: 'Lisa Chen',
      reportedAt: new Date(Date.now() - 7200000), // 2 hours ago
      description: 'Large pile of construction debris dumped near the river bank.',
      photos: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=300&h=200&fit=crop'],
      upvotes: 8,
      comments: 5
    },
    {
      id: 'RPT003',
      type: 'water_pollution',
      title: 'Discolored Water in Creek',
      location: '0.8 miles away • Downtown District',
      distance: 0.8,
      severity: 'high',
      status: 'resolved',
      reportedBy: 'James Wilson',
      reportedAt: new Date(Date.now() - 86400000), // 1 day ago
      description: 'Creek water has turned brown with visible oil slick on surface.',
      photos: ['https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=300&h=200&fit=crop'],
      upvotes: 15,
      comments: 8
    },
    {
      id: 'RPT004',
      type: 'noise_pollution',
      title: 'Construction Noise Violation',
      location: '1.2 miles away • Residential North',
      distance: 1.2,
      severity: 'moderate',
      status: 'investigating',
      reportedBy: 'Anna Martinez',
      reportedAt: new Date(Date.now() - 10800000), // 3 hours ago
      description: 'Construction work starting at 5 AM, exceeding noise ordinance limits.',
      photos: [],
      upvotes: 6,
      comments: 2
    }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Reports', count: nearbyReports?.length },
    { value: 'air_pollution', label: 'Air Pollution', count: 1 },
    { value: 'water_pollution', label: 'Water Pollution', count: 1 },
    { value: 'litter_waste', label: 'Litter & Waste', count: 1 },
    { value: 'noise_pollution', label: 'Noise Pollution', count: 1 }
  ];

  const getIssueTypeInfo = (typeId) => {
    const types = {
      air_pollution: { name: 'Air Pollution', icon: 'Wind', color: '#DC2626' },
      water_pollution: { name: 'Water Pollution', icon: 'Droplets', color: '#4A90A4' },
      noise_pollution: { name: 'Noise Pollution', icon: 'Volume2', color: '#D97706' },
      litter_waste: { name: 'Litter & Waste', icon: 'Trash2', color: '#6B7280' }
    };
    return types?.[typeId] || types?.air_pollution;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return '#059669';
      case 'moderate': return '#D97706';
      case 'high': return '#DC2626';
      case 'critical': return '#7C2D12';
      default: return '#6B7280';
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'reported':
        return { label: 'Reported', color: '#6B7280', icon: 'Clock' };
      case 'investigating':
        return { label: 'Investigating', color: '#D97706', icon: 'Search' };
      case 'resolved':
        return { label: 'Resolved', color: '#059669', icon: 'CheckCircle' };
      default:
        return { label: 'Unknown', color: '#6B7280', icon: 'HelpCircle' };
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const filteredReports = selectedFilter === 'all' 
    ? nearbyReports 
    : nearbyReports?.filter(report => report?.type === selectedFilter);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Nearby Reports</h3>
        <p className="text-sm text-muted-foreground">Recent environmental reports in your area</p>
      </div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterOptions?.map((option) => (
          <button
            key={option?.value}
            onClick={() => setSelectedFilter(option?.value)}
            className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedFilter === option?.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            <span>{option?.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              selectedFilter === option?.value
                ? 'bg-primary-foreground/20'
                : 'bg-foreground/10'
            }`}>
              {option?.count}
            </span>
          </button>
        ))}
      </div>
      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports?.length > 0 ? (
          filteredReports?.map((report) => {
            const issueType = getIssueTypeInfo(report?.type);
            const statusInfo = getStatusInfo(report?.status);
            
            return (
              <div key={report?.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-start space-x-4">
                  {/* Issue Type Icon */}
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${issueType?.color}15`, color: issueType?.color }}
                  >
                    <Icon name={issueType?.icon} size={18} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">{report?.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Icon name="MapPin" size={12} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{report?.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getSeverityColor(report?.severity) }}
                        />
                        <div 
                          className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                          style={{ backgroundColor: `${statusInfo?.color}15`, color: statusInfo?.color }}
                        >
                          <Icon name={statusInfo?.icon} size={10} />
                          <span>{statusInfo?.label}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{report?.description}</p>

                    {/* Photo Preview */}
                    {report?.photos?.length > 0 && (
                      <div className="mb-3">
                        <div className="w-20 h-12 rounded overflow-hidden">
                          <Image
                            src={report?.photos?.[0]}
                            alt="Report evidence"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>By {report?.reportedBy}</span>
                        <span>{formatTimeAgo(report?.reportedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200">
                          <Icon name="ThumbsUp" size={12} />
                          <span>{report?.upvotes}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200">
                          <Icon name="MessageCircle" size={12} />
                          <span>{report?.comments}</span>
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No reports found for the selected filter</p>
          </div>
        )}
      </div>
      {/* View All Button */}
      {filteredReports?.length > 0 && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            iconName="ExternalLink"
            iconPosition="right"
          >
            View All Reports on Map
          </Button>
        </div>
      )}
    </div>
  );
};

export default NearbyReports;
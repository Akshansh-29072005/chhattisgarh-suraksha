import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ImpactTracking = ({ impactData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const categories = [
    { value: 'all', label: 'All Activities', icon: 'Activity' },
    { value: 'reports', label: 'Reports', icon: 'FileText' },
    { value: 'community', label: 'Community', icon: 'Users' },
    { value: 'data', label: 'Data Collection', icon: 'Database' }
  ];

  const achievements = [
    {
      id: 1,
      title: 'Environmental Reporter',
      description: 'Submitted 10+ environmental reports',
      icon: 'Award',
      earned: true,
      earnedDate: '2024-09-15',
      progress: 100,
      color: 'text-success'
    },
    {
      id: 2,
      title: 'Community Leader',
      description: 'Helped 50+ community members',
      icon: 'Crown',
      earned: true,
      earnedDate: '2024-08-22',
      progress: 100,
      color: 'text-warning'
    },
    {
      id: 3,
      title: 'Data Collector',
      description: 'Contributed 100+ data points',
      icon: 'Database',
      earned: false,
      progress: 75,
      color: 'text-primary'
    },
    {
      id: 4,
      title: 'Sustainability Champion',
      description: 'Maintained 6-month active streak',
      icon: 'Zap',
      earned: false,
      progress: 60,
      color: 'text-accent'
    }
  ];

  const contributionStats = [
    {
      label: 'Reports Submitted',
      value: impactData?.reportsSubmitted,
      change: '+12%',
      trend: 'up',
      icon: 'FileText',
      color: 'text-primary'
    },
    {
      label: 'Community Interactions',
      value: impactData?.communityInteractions,
      change: '+8%',
      trend: 'up',
      icon: 'MessageCircle',
      color: 'text-secondary'
    },
    {
      label: 'Data Points Contributed',
      value: impactData?.dataPointsContributed,
      change: '+25%',
      trend: 'up',
      icon: 'TrendingUp',
      color: 'text-success'
    },
    {
      label: 'Environmental Score',
      value: impactData?.environmentalScore,
      change: '+5%',
      trend: 'up',
      icon: 'Leaf',
      color: 'text-accent'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'report',
      title: 'Air Quality Report Submitted',
      description: 'Reported poor air quality in Downtown District',
      timestamp: '2024-10-06T14:30:00Z',
      impact: '+15 points',
      icon: 'Wind'
    },
    {
      id: 2,
      type: 'community',
      title: 'Helped Community Member',
      description: 'Answered question about water quality testing',
      timestamp: '2024-10-05T16:45:00Z',
      impact: '+10 points',
      icon: 'Users'
    },
    {
      id: 3,
      type: 'data',
      title: 'Temperature Data Contributed',
      description: 'Submitted temperature readings for River Park',
      timestamp: '2024-10-04T09:15:00Z',
      impact: '+5 points',
      icon: 'Thermometer'
    },
    {
      id: 4,
      type: 'achievement',
      title: 'Badge Earned',
      description: 'Earned "Environmental Reporter" badge',
      timestamp: '2024-10-03T12:00:00Z',
      impact: '+50 points',
      icon: 'Award'
    }
  ];

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'report':
        return 'FileText';
      case 'community':
        return 'Users';
      case 'data':
        return 'Database';
      case 'achievement':
        return 'Award';
      default:
        return 'Activity';
    }
  };

  return (
    <div className="space-y-6">
      {/* Period and Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-2">
          {periods?.map((period) => (
            <Button
              key={period?.value}
              variant={selectedPeriod === period?.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period?.value)}
            >
              {period?.label}
            </Button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories?.map((category) => (
            <Button
              key={category?.value}
              variant={selectedCategory === category?.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category?.value)}
              iconName={category?.icon}
              iconPosition="left"
            >
              {category?.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Contribution Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {contributionStats?.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name={stat?.icon} size={24} className={stat?.color} />
              <div className={`flex items-center space-x-1 text-sm ${
                stat?.trend === 'up' ? 'text-success' : 'text-error'
              }`}>
                <Icon name={stat?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} />
                <span>{stat?.change}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat?.value}</div>
            <div className="text-sm text-muted-foreground">{stat?.label}</div>
          </div>
        ))}
      </div>
      {/* Achievements & Badges */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Trophy" size={20} className="mr-2 text-primary" />
          Achievements & Badges
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements?.map((achievement) => (
            <div
              key={achievement?.id}
              className={`p-4 border rounded-lg transition-all duration-200 ${
                achievement?.earned
                  ? 'border-success bg-success/5' :'border-border bg-muted/30'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  achievement?.earned ? 'bg-success/20' : 'bg-muted'
                }`}>
                  <Icon
                    name={achievement?.icon}
                    size={20}
                    className={achievement?.earned ? 'text-success' : 'text-muted-foreground'}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${
                      achievement?.earned ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement?.title}
                    </h4>
                    {achievement?.earned && (
                      <Icon name="Check" size={16} className="text-success" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement?.description}
                  </p>
                  
                  {achievement?.earned ? (
                    <div className="text-xs text-success">
                      Earned {new Date(achievement.earnedDate)?.toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground">{achievement?.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${achievement?.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Activities */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Activity" size={20} className="mr-2 text-primary" />
          Recent Activities
        </h3>
        
        <div className="space-y-4">
          {recentActivities?.map((activity) => (
            <div key={activity?.id} className="flex items-start space-x-3 p-3 hover:bg-muted rounded-lg transition-colors duration-200">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon name={activity?.icon} size={16} className="text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-foreground">{activity?.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-success font-medium">{activity?.impact}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity?.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{activity?.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button variant="outline" iconName="MoreHorizontal" iconPosition="left">
            View All Activities
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImpactTracking;
import React from 'react';
import Icon from '../../../components/AppIcon';

const CommunityStats = () => {
  // Try to load dynamic community stats from local storage (prototype)
  const [reportsCount, setReportsCount] = React.useState(Number(localStorage.getItem('cs_reports_count') || 0));
  const [membersCount, setMembersCount] = React.useState(Number(localStorage.getItem('cs_members_count') || 0));
  const [impactPoints, setImpactPoints] = React.useState(Number(localStorage.getItem('cs_impact_points') || 0));

  React.useEffect(() => {
    const update = () => {
      setReportsCount(Number(localStorage.getItem('cs_reports_count') || 0));
      setMembersCount(Number(localStorage.getItem('cs_members_count') || 0));
      setImpactPoints(Number(localStorage.getItem('cs_impact_points') || 0));
    };

    window.addEventListener('cs:data-updated', update);
    // initial update
    update();
    return () => window.removeEventListener('cs:data-updated', update);
  }, []);

  const stats = [
    {
      id: 'reports',
      title: 'Community Reports',
      value: reportsCount.toLocaleString(),
      change: reportsCount > 0 ? `+${Math.min(99, Math.round((reportsCount / 10) * 1))}%` : '+0%',
      trend: reportsCount > 0 ? 'up' : 'neutral',
      icon: 'FileText',
      description: 'Total reports submitted'
    },
    {
      id: 'users',
      title: 'Active Users',
      value: membersCount.toLocaleString(),
      change: membersCount > 0 ? `+${Math.min(99, Math.round((membersCount / 100) * 1))}%` : '+0%',
      trend: membersCount > 0 ? 'up' : 'neutral',
      icon: 'Users',
      description: 'Registered members'
    },
    {
      id: 'impact',
      title: 'CO₂ Reduced',
      value: `${(impactPoints / 1000).toFixed(2)}T`,
      change: impactPoints > 0 ? `+${Math.round((impactPoints / 100) * 1)}%` : '+0%',
      trend: impactPoints > 0 ? 'up' : 'neutral',
      icon: 'Leaf',
      description: 'Estimated impact'
    },
    {
      id: 'score',
      title: 'Your Impact Score',
      value: `${impactPoints}`,
      change: '+0',
      trend: 'neutral',
      icon: 'Award',
      description: 'Points earned'
    }
  ];

  // Achievement badges: thresholds 5, 10, 20 reports
  const badgeThresholds = [5, 10, 20];
  const achievements = badgeThresholds.map((threshold, idx) => {
    const earned = reportsCount >= threshold;
    const progress = Math.min(100, Math.round((reportsCount / threshold) * 100));
    return {
      id: idx + 1,
      title: `${threshold} Reports Submitted`,
      description: `Submit ${threshold} reports to earn this badge`,
      icon: idx === 0 ? 'FileText' : idx === 1 ? 'Users' : 'Award',
      earned,
      date: earned ? 'Earned recently' : null,
      progress
    };
  });

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-success' : 'text-error';
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'TrendingUp' : 'TrendingDown';
  };

  return (
    <div className="space-y-6">
      {/* Community Statistics */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Community Engagement</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.map((stat) => (
            <div key={stat?.id} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Icon name={stat?.icon} size={20} className="text-primary" />
                <div className={`flex items-center space-x-1 ${getTrendColor(stat?.trend)}`}>
                  <Icon name={getTrendIcon(stat?.trend)} size={14} />
                  <span className="text-sm font-medium">{stat?.change}</span>
                </div>
              </div>
              
              <div className="text-2xl font-bold text-foreground mb-1">{stat?.value}</div>
              <div className="text-sm text-muted-foreground">{stat?.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat?.description}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Achievement Badges */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Achievement Badges</h3>
          <span className="text-sm text-muted-foreground">
            {achievements?.filter(a => a?.earned)?.length} of {achievements?.length} earned
          </span>
        </div>
        
        <div className="space-y-3">
          {achievements?.map((achievement) => (
            <div
              key={achievement?.id}
              className={`flex items-center space-x-4 p-3 rounded-lg border transition-colors duration-200 ${
                achievement?.earned
                  ? 'bg-success/5 border-success/20' :'bg-muted/30 border-border'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                achievement?.earned
                  ? 'bg-success/20 text-success' :'bg-muted text-muted-foreground'
              }`}>
                <Icon name={achievement?.icon} size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium ${
                  achievement?.earned ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {achievement?.title}
                </h4>
                <p className="text-sm text-muted-foreground">{achievement?.description}</p>
                
                {achievement?.earned ? (
                  <div className="text-xs text-success mt-1">
                    Earned {achievement?.date}
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{achievement?.progress}%</span>
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
              
              {achievement?.earned && (
                <Icon name="CheckCircle" size={20} className="text-success" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityStats;
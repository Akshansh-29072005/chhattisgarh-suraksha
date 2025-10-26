import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const quickActions = [
    {
      id: 'report',
      title: 'Report Issue',
      description: 'Submit environmental concern',
      icon: 'FileText',
      color: 'bg-error/10 text-error border-error/20',
      route: '/citizen-reporting'
    },
    {
      id: 'export',
      title: 'Export Data',
      description: 'Download environmental reports',
      icon: 'Download',
      color: 'bg-primary/10 text-primary border-primary/20',
      action: 'export'
    },
    {
      id: 'alerts',
      title: 'Configure Alerts',
      description: 'Manage notification settings',
      icon: 'Bell',
      color: 'bg-warning/10 text-warning border-warning/20',
      action: 'alerts'
    },
    {
      id: 'share',
      title: 'Share Data',
      description: 'Share environmental insights',
      icon: 'Share2',
      color: 'bg-success/10 text-success border-success/20',
      action: 'share'
    }
  ];

  const handleAction = (actionType) => {
    switch (actionType) {
      case 'export':
        console.log('Exporting environmental data...');
        // In real app, this would trigger data export
        break;
      case 'report':
        // Prototype: increment local report counter and impact points
        try {
          const prev = Number(localStorage.getItem('cs_reports_count') || 0);
          const newCount = prev + 1;
          localStorage.setItem('cs_reports_count', String(newCount));
          // Add some impact points for each report
          const prevPoints = Number(localStorage.getItem('cs_impact_points') || 0);
          localStorage.setItem('cs_impact_points', String(prevPoints + 10));
          console.log('Prototype: incremented report count to', newCount);
          // Optionally trigger a custom event so other components can refresh
          window.dispatchEvent(new CustomEvent('cs:data-updated'));
        } catch (e) {
          console.warn('Failed to increment prototype report count', e);
        }
        break;
      case 'alerts': console.log('Opening alert configuration...');
        // In real app, this would open alert settings modal
        break;
      case 'share': console.log('Opening share options...');
        // In real app, this would open share modal
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions?.map((action) => {
          const ActionComponent = action?.route ? Link : 'button';
          const actionProps = action?.route 
            ? { to: action?.route }
            : { onClick: () => handleAction(action?.action) };

          return (
            <ActionComponent
              key={action?.id}
              {...actionProps}
              className={`p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md hover:scale-105 text-left block ${action?.color}`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Icon name={action?.icon} size={24} />
                <h4 className="font-semibold">{action?.title}</h4>
              </div>
              <p className="text-sm opacity-80">{action?.description}</p>
            </ActionComponent>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Last action: Data export • 2 hours ago
          </div>
          <Button variant="ghost" size="sm">
            <Icon name="History" size={16} className="mr-2" />
            View History
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
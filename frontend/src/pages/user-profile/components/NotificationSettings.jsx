import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const NotificationSettings = ({ settings, onUpdateSettings }) => {
  const [notificationSettings, setNotificationSettings] = useState(settings);
  const [isLoading, setIsLoading] = useState(false);

  const notificationTypes = [
    {
      id: 'environmental_alerts',
      name: 'Environmental Alerts',
      description: 'Critical environmental conditions and emergencies',
      icon: 'AlertTriangle',
      priority: 'high',
      channels: ['email', 'sms', 'push', 'in_app']
    },
    {
      id: 'air_quality',
      name: 'Air Quality Updates',
      description: 'Changes in air quality levels in your area',
      icon: 'Wind',
      priority: 'medium',
      channels: ['email', 'push', 'in_app']
    },
    {
      id: 'water_quality',
      name: 'Water Quality Alerts',
      description: 'Water contamination and quality warnings',
      icon: 'Droplets',
      priority: 'high',
      channels: ['email', 'sms', 'push', 'in_app']
    },
    {
      id: 'community_updates',
      name: 'Community Updates',
      description: 'New posts, replies, and community activities',
      icon: 'Users',
      priority: 'low',
      channels: ['email', 'push', 'in_app']
    },
    {
      id: 'report_status',
      name: 'Report Status Updates',
      description: 'Updates on your submitted environmental reports',
      icon: 'FileText',
      priority: 'medium',
      channels: ['email', 'push', 'in_app']
    },
    {
      id: 'system_updates',
      name: 'System Updates',
      description: 'Platform updates, maintenance, and new features',
      icon: 'Settings',
      priority: 'low',
      channels: ['email', 'in_app']
    }
  ];

  const deliveryMethods = [
    { id: 'email', name: 'Email', icon: 'Mail', enabled: true },
    { id: 'sms', name: 'SMS', icon: 'MessageSquare', enabled: false },
    { id: 'push', name: 'Push Notifications', icon: 'Bell', enabled: true },
    { id: 'in_app', name: 'In-App Notifications', icon: 'Monitor', enabled: true }
  ];

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly digest' },
    { value: 'daily', label: 'Daily digest' },
    { value: 'weekly', label: 'Weekly digest' },
    { value: 'never', label: 'Never' }
  ];

  const quietHours = [
    { value: 'none', label: 'No quiet hours' },
    { value: '22-08', label: '10 PM - 8 AM' },
    { value: '23-07', label: '11 PM - 7 AM' },
    { value: '00-06', label: '12 AM - 6 AM' },
    { value: 'custom', label: 'Custom hours' }
  ];

  const handleNotificationToggle = (typeId, channel) => {
    setNotificationSettings(prev => ({
      ...prev,
      notifications: {
        ...prev?.notifications,
        [typeId]: {
          ...prev?.notifications?.[typeId],
          [channel]: !prev?.notifications?.[typeId]?.[channel]
        }
      }
    }));
  };

  const handleDeliveryMethodToggle = (methodId) => {
    setNotificationSettings(prev => ({
      ...prev,
      deliveryMethods: {
        ...prev?.deliveryMethods,
        [methodId]: !prev?.deliveryMethods?.[methodId]
      }
    }));
  };

  const handleFrequencyChange = (typeId, frequency) => {
    setNotificationSettings(prev => ({
      ...prev,
      frequency: {
        ...prev?.frequency,
        [typeId]: frequency
      }
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onUpdateSettings(notificationSettings);
      setIsLoading(false);
      alert('Notification settings saved successfully!');
    }, 1500);
  };

  const enableAllCritical = () => {
    const criticalTypes = notificationTypes?.filter(type => type?.priority === 'high');
    const updatedSettings = { ...notificationSettings };
    
    criticalTypes?.forEach(type => {
      updatedSettings.notifications[type.id] = {};
      type?.channels?.forEach(channel => {
        updatedSettings.notifications[type.id][channel] = true;
      });
      updatedSettings.frequency[type.id] = 'immediate';
    });
    
    setNotificationSettings(updatedSettings);
  };

  const disableAllNonCritical = () => {
    const nonCriticalTypes = notificationTypes?.filter(type => type?.priority !== 'high');
    const updatedSettings = { ...notificationSettings };
    
    nonCriticalTypes?.forEach(type => {
      updatedSettings.notifications[type.id] = {};
      type?.channels?.forEach(channel => {
        updatedSettings.notifications[type.id][channel] = false;
      });
    });
    
    setNotificationSettings(updatedSettings);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Zap" size={20} className="mr-2 text-primary" />
          Quick Actions
        </h3>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={enableAllCritical}
            iconName="AlertTriangle"
            iconPosition="left"
          >
            Enable All Critical Alerts
          </Button>
          <Button
            variant="outline"
            onClick={disableAllNonCritical}
            iconName="BellOff"
            iconPosition="left"
          >
            Disable Non-Critical
          </Button>
        </div>
      </div>
      {/* Delivery Methods */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Send" size={20} className="mr-2 text-primary" />
          Delivery Methods
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveryMethods?.map((method) => (
            <div
              key={method?.id}
              className={`p-4 border rounded-lg transition-colors duration-200 ${
                notificationSettings?.deliveryMethods?.[method?.id]
                  ? 'border-primary bg-primary/5' :'border-border bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon
                    name={method?.icon}
                    size={20}
                    className={notificationSettings?.deliveryMethods?.[method?.id] ? 'text-primary' : 'text-muted-foreground'}
                  />
                  <span className={`font-medium ${
                    notificationSettings?.deliveryMethods?.[method?.id] ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {method?.name}
                  </span>
                </div>
                <Checkbox
                  checked={notificationSettings?.deliveryMethods?.[method?.id]}
                  onChange={() => handleDeliveryMethodToggle(method?.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Notification Types */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Bell" size={20} className="mr-2 text-primary" />
          Notification Types
        </h3>
        
        <div className="space-y-6">
          {notificationTypes?.map((type) => (
            <div key={type?.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <Icon name={type?.icon} size={20} className={getPriorityColor(type?.priority)} />
                  <div>
                    <h4 className="font-medium text-foreground flex items-center space-x-2">
                      <span>{type?.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        type?.priority === 'high' ? 'bg-error/10 text-error' :
                        type?.priority === 'medium'? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                      }`}>
                        {type?.priority}
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{type?.description}</p>
                  </div>
                </div>
                
                <Select
                  options={frequencyOptions}
                  value={notificationSettings?.frequency?.[type?.id] || 'immediate'}
                  onChange={(value) => handleFrequencyChange(type?.id, value)}
                  className="w-40"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {type?.channels?.map((channel) => {
                  const method = deliveryMethods?.find(m => m?.id === channel);
                  const isEnabled = notificationSettings?.notifications?.[type?.id]?.[channel];
                  const isMethodEnabled = notificationSettings?.deliveryMethods?.[channel];
                  
                  return (
                    <div
                      key={channel}
                      className={`p-3 border rounded-lg transition-colors duration-200 ${
                        isEnabled && isMethodEnabled
                          ? 'border-primary bg-primary/5' :'border-border bg-muted/30'
                      } ${!isMethodEnabled ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon
                            name={method?.icon}
                            size={16}
                            className={isEnabled && isMethodEnabled ? 'text-primary' : 'text-muted-foreground'}
                          />
                          <span className="text-sm font-medium">{method?.name}</span>
                        </div>
                        <Checkbox
                          checked={isEnabled}
                          onChange={() => handleNotificationToggle(type?.id, channel)}
                          disabled={!isMethodEnabled}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Advanced Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Settings" size={20} className="mr-2 text-primary" />
          Advanced Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quiet Hours
            </label>
            <Select
              options={quietHours}
              value={notificationSettings?.quietHours || 'none'}
              onChange={(value) => setNotificationSettings(prev => ({ ...prev, quietHours: value }))}
              description="Suppress non-critical notifications during these hours"
            />
          </div>
          
          <div className="space-y-3">
            <Checkbox
              label="Location-based Notifications"
              description="Receive notifications based on your current location"
              checked={notificationSettings?.locationBased || false}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, locationBased: e?.target?.checked }))}
            />
            
            <Checkbox
              label="Predictive Alerts"
              description="Receive AI-powered predictions about environmental conditions"
              checked={notificationSettings?.predictiveAlerts || true}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, predictiveAlerts: e?.target?.checked }))}
            />
            
            <Checkbox
              label="Community Digest"
              description="Receive weekly summaries of community activities"
              checked={notificationSettings?.communityDigest || true}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, communityDigest: e?.target?.checked }))}
            />
          </div>
        </div>
      </div>
      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          loading={isLoading}
          iconName="Save"
          iconPosition="left"
        >
          Save Notification Settings
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
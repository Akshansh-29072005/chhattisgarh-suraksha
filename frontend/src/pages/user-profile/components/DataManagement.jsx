import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const DataManagement = () => {
  const [exportSettings, setExportSettings] = useState({
    dataType: 'all',
    format: 'json',
    dateRange: 'last_month',
    includePersonalData: true,
    includeReports: true,
    includeInteractions: false
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const dataTypes = [
    { value: 'all', label: 'All Data' },
    { value: 'reports', label: 'Environmental Reports Only' },
    { value: 'interactions', label: 'Community Interactions Only' },
    { value: 'personal', label: 'Personal Data Only' },
    { value: 'analytics', label: 'Analytics Data Only' }
  ];

  const exportFormats = [
    { value: 'json', label: 'JSON (.json)' },
    { value: 'csv', label: 'CSV (.csv)' },
    { value: 'xlsx', label: 'Excel (.xlsx)' },
    { value: 'pdf', label: 'PDF Report (.pdf)' }
  ];

  const dateRanges = [
    { value: 'last_week', label: 'Last 7 days' },
    { value: 'last_month', label: 'Last 30 days' },
    { value: 'last_quarter', label: 'Last 3 months' },
    { value: 'last_year', label: 'Last 12 months' },
    { value: 'all_time', label: 'All time' },
    { value: 'custom', label: 'Custom range' }
  ];

  const dataCategories = [
    {
      id: 'reports',
      name: 'Environmental Reports',
      description: 'All submitted environmental reports and observations',
      size: '2.3 MB',
      count: 47,
      icon: 'FileText'
    },
    {
      id: 'interactions',
      name: 'Community Interactions',
      description: 'Forum posts, comments, and community engagement data',
      size: '1.8 MB',
      count: 156,
      icon: 'MessageCircle'
    },
    {
      id: 'analytics',
      name: 'Analytics Data',
      description: 'Usage patterns, preferences, and behavioral insights',
      size: '0.9 MB',
      count: 1203,
      icon: 'BarChart3'
    },
    {
      id: 'personal',
      name: 'Personal Information',
      description: 'Profile data, settings, and account information',
      size: '0.2 MB',
      count: 1,
      icon: 'User'
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      
      // Create mock download
      const mockData = {
        exportDate: new Date()?.toISOString(),
        settings: exportSettings,
        message: 'This is a mock export. In a real application, this would contain your actual data.'
      };
      
      const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecowatch-data-export-${new Date()?.toISOString()?.split('T')?.[0]}.${exportSettings?.format}`;
      document.body?.appendChild(a);
      a?.click();
      document.body?.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Data export completed successfully!');
    }, 3000);
  };

  const handleDeleteData = (categoryId) => {
    if (confirm(`Are you sure you want to delete all ${categoryId} data? This action cannot be undone.`)) {
      alert(`${categoryId} data deletion would be processed here.`);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your entire account? This action is permanent and cannot be undone.')) {
      alert('Account deletion process would be initiated here.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Download" size={20} className="mr-2 text-primary" />
          Export Your Data
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Select
              label="Data Type"
              options={dataTypes}
              value={exportSettings?.dataType}
              onChange={(value) => setExportSettings(prev => ({ ...prev, dataType: value }))}
            />
            
            <Select
              label="Export Format"
              options={exportFormats}
              value={exportSettings?.format}
              onChange={(value) => setExportSettings(prev => ({ ...prev, format: value }))}
            />
            
            <Select
              label="Date Range"
              options={dateRanges}
              value={exportSettings?.dateRange}
              onChange={(value) => setExportSettings(prev => ({ ...prev, dateRange: value }))}
            />
            
            {exportSettings?.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={customDateRange?.startDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e?.target?.value }))}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={customDateRange?.endDate}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e?.target?.value }))}
                />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Include Data Categories
              </label>
              <div className="space-y-2">
                <Checkbox
                  label="Personal Information"
                  description="Profile data and account settings"
                  checked={exportSettings?.includePersonalData}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, includePersonalData: e?.target?.checked }))}
                />
                
                <Checkbox
                  label="Environmental Reports"
                  description="All submitted reports and observations"
                  checked={exportSettings?.includeReports}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, includeReports: e?.target?.checked }))}
                />
                
                <Checkbox
                  label="Community Interactions"
                  description="Forum posts and community engagement"
                  checked={exportSettings?.includeInteractions}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, includeInteractions: e?.target?.checked }))}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleExport}
            loading={isExporting}
            iconName="Download"
            iconPosition="left"
          >
            {isExporting ? 'Preparing Export...' : 'Export Data'}
          </Button>
        </div>
      </div>
      {/* Data Categories Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Database" size={20} className="mr-2 text-primary" />
          Your Data Overview
        </h3>
        
        <div className="space-y-4">
          {dataCategories?.map((category) => (
            <div key={category?.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name={category?.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{category?.name}</h4>
                  <p className="text-sm text-muted-foreground">{category?.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-muted-foreground">{category?.count} items</span>
                    <span className="text-xs text-muted-foreground">{category?.size}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  iconPosition="left"
                  onClick={() => {
                    setExportSettings(prev => ({ ...prev, dataType: category?.id }));
                    handleExport();
                  }}
                >
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Trash2"
                  iconPosition="left"
                  onClick={() => handleDeleteData(category?.id)}
                  className="text-error hover:text-error"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Data Retention Policy */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Clock" size={20} className="mr-2 text-primary" />
          Data Retention Policy
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Automatic Data Cleanup</h4>
            <p className="text-sm text-muted-foreground mb-3">
              We automatically remove certain types of data after specified periods to protect your privacy and comply with regulations.
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Analytics data:</span>
                <span className="text-foreground">Deleted after 2 years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temporary files:</span>
                <span className="text-foreground">Deleted after 30 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session logs:</span>
                <span className="text-foreground">Deleted after 90 days</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-warning rounded-lg bg-warning/5">
            <div className="flex items-start space-x-3">
              <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Data Backup Recommendation</h4>
                <p className="text-sm text-muted-foreground">
                  We recommend regularly exporting your data as a backup. Environmental reports and community contributions are valuable and should be preserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Danger Zone */}
      <div className="bg-card border border-error rounded-lg p-6">
        <h3 className="text-lg font-semibold text-error mb-4 flex items-center">
          <Icon name="AlertTriangle" size={20} className="mr-2" />
          Danger Zone
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 border border-error/20 rounded-lg bg-error/5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Delete Account</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                iconName="Trash2"
                iconPosition="left"
              >
                Delete Account
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Note:</strong> Before deleting your account, consider exporting your data. 
              Some environmental reports may be valuable for ongoing research and community efforts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import { userAPI } from '../../../utils/api';

const AccountSettings = ({ user, onUpdateSettings }) => {
  const [settings, setSettings] = useState({
    email: user?.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: user?.twoFactorEnabled || false,
    emailNotifications: user?.emailNotifications || true,
    smsNotifications: user?.smsNotifications || false,
    marketingEmails: user?.marketingEmails || false,
    dataSharing: user?.dataSharing || true
  });
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePasswordChange = () => {
    const newErrors = {};
    
    if (!settings?.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!settings?.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (settings?.newPassword?.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (settings?.newPassword !== settings?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handlePasswordChange = async () => {
    const validationErrors = validatePasswordChange();
    if (Object.keys(validationErrors)?.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsChangingPassword(false);
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      alert('Password changed successfully!');
    }, 2000);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.updateProfile({
        fullName: user.name,
        email: settings.email,
        address: user.location,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        marketingEmails: settings.marketingEmails,
        dataSharing: settings.dataSharing
      });
      onUpdateSettings(response.data);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = () => {
    // In real app, this would initiate 2FA setup flow
    alert('Two-factor authentication setup would be initiated here');
  };

  return (
    <div className="space-y-6">
      {/* Email Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Mail" size={20} className="mr-2 text-primary" />
          Email Settings
        </h3>
        
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={settings?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            description="This email will be used for account notifications and login"
          />
          
          <div className="space-y-3">
            <Checkbox
              label="Email Notifications"
              description="Receive environmental alerts and updates via email"
              checked={settings?.emailNotifications}
              onChange={(e) => handleInputChange('emailNotifications', e?.target?.checked)}
            />
            
            <Checkbox
              label="Marketing Emails"
              description="Receive newsletters and promotional content"
              checked={settings?.marketingEmails}
              onChange={(e) => handleInputChange('marketingEmails', e?.target?.checked)}
            />
          </div>
        </div>
      </div>
      {/* Password & Security */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Shield" size={20} className="mr-2 text-primary" />
          Password & Security
        </h3>
        
        <div className="space-y-4">
          {!isChangingPassword ? (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="font-medium text-foreground">Password</div>
                <div className="text-sm text-muted-foreground">Last changed 3 months ago</div>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
                iconName="Key"
                iconPosition="left"
              >
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <Input
                label="Current Password"
                type="password"
                value={settings?.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e?.target?.value)}
                error={errors?.currentPassword}
                required
              />
              
              <Input
                label="New Password"
                type="password"
                value={settings?.newPassword}
                onChange={(e) => handleInputChange('newPassword', e?.target?.value)}
                error={errors?.newPassword}
                description="Must be at least 8 characters long"
                required
              />
              
              <Input
                label="Confirm New Password"
                type="password"
                value={settings?.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
                error={errors?.confirmPassword}
                required
              />
              
              <div className="flex space-x-3">
                <Button
                  onClick={handlePasswordChange}
                  loading={isLoading}
                  iconName="Check"
                  iconPosition="left"
                >
                  Update Password
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsChangingPassword(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <div className="font-medium text-foreground">Two-Factor Authentication</div>
              <div className="text-sm text-muted-foreground">
                {settings?.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {settings?.twoFactorEnabled && (
                <div className="flex items-center space-x-1 text-success">
                  <Icon name="Shield" size={16} />
                  <span className="text-sm font-medium">Active</span>
                </div>
              )}
              <Button
                variant={settings?.twoFactorEnabled ? "outline" : "default"}
                onClick={handleEnable2FA}
                iconName={settings?.twoFactorEnabled ? "Settings" : "Plus"}
                iconPosition="left"
              >
                {settings?.twoFactorEnabled ? 'Manage' : 'Enable'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Privacy Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Lock" size={20} className="mr-2 text-primary" />
          Privacy Settings
        </h3>
        
        <div className="space-y-4">
          <Checkbox
            label="SMS Notifications"
            description="Receive critical alerts via text message"
            checked={settings?.smsNotifications}
            onChange={(e) => handleInputChange('smsNotifications', e?.target?.checked)}
          />
          
          <Checkbox
            label="Data Sharing for Research"
            description="Allow anonymized data to be used for environmental research"
            checked={settings?.dataSharing}
            onChange={(e) => handleInputChange('dataSharing', e?.target?.checked)}
          />
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
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default AccountSettings;
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { userAPI } from '../../utils/api';

const UserStatusIndicator = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Real user data fetched from API
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const resp = await userAPI.getProfile();
        // Backend returns a profile object - adapt to expected shape
        if (mounted && resp?.data) {
          const p = resp.data;
          setCurrentUser({
            name: p.name || p.full_name || p.name || 'Unknown',
            email: p.email || '',
            role: p.userType || 'Citizen',
            avatar: p.avatar || null,
            status: 'online',
            lastActive: new Date(p.joinDate || Date.now()),
            permissions: p.permissions || []
          });
        }
      } catch (err) {
        console.warn('Failed to load user profile for UserStatusIndicator:', err);
        // keep null - UI falls back to generic placeholder
      }
    };

    loadProfile();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    return name?.split(' ')?.map(word => word?.charAt(0))?.join('')?.toUpperCase()?.slice(0, 2);
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'environmental scientist':
        return 'Microscope';
      case 'city planner':
        return 'Building';
      case 'activist':
        return 'Megaphone';
      case 'citizen':
        return 'User';
      default:
        return 'User';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-success';
      case 'away':
        return 'bg-warning';
      case 'offline':
        return 'bg-muted-foreground';
      default:
        return 'bg-muted-foreground';
    }
  };

  const handleLogout = () => {
    // In real app, this would call auth logout function
    console.log('Logging out...');
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2"
      >
        <div className="relative">
          {currentUser?.avatar ? (
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              {getInitials(currentUser?.name || 'User')}
            </div>
          )}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(currentUser?.status)}`} />
        </div>
        <div className="hidden lg:block text-left">
          <div className="text-sm font-medium text-foreground">{currentUser?.name || 'Guest'}</div>
          <div className="text-xs text-muted-foreground">{currentUser?.role || ''}</div>
        </div>
        <Icon name="ChevronDown" size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </Button>
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-elevated z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-medium">
                    {getInitials(currentUser?.name)}
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(currentUser?.status)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{currentUser?.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{currentUser?.email}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Icon name={getRoleIcon(currentUser?.role)} size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{currentUser?.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-2">
            <Link
              to="/user-profile"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-md transition-colors duration-200"
            >
              <Icon name="User" size={16} className="text-muted-foreground" />
              <span>View Profile</span>
            </Link>

            <button
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-md transition-colors duration-200"
            >
              <Icon name="Settings" size={16} className="text-muted-foreground" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-md transition-colors duration-200"
            >
              <Icon name="Bell" size={16} className="text-muted-foreground" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-left hover:bg-muted rounded-md transition-colors duration-200"
            >
              <Icon name="HelpCircle" size={16} className="text-muted-foreground" />
              <span>Help & Support</span>
            </button>
          </div>

          {/* Status & Permissions */}
          <div className="p-4 border-t border-border">
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Status
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(currentUser?.status)}`} />
                  <span className="text-sm capitalize">{currentUser?.status}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Permissions
                </div>
                <div className="flex flex-wrap gap-1">
                  {currentUser?.permissions?.map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md"
                    >
                      {permission?.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="p-2 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-left text-error hover:bg-error/10 rounded-md transition-colors duration-200"
            >
              <Icon name="LogOut" size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatusIndicator;
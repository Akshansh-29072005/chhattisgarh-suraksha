import React, { createContext, useState, useContext, useEffect } from 'react';
import { userAPI } from '../utils/api';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await userAPI.getProfile();
      // userAPI.getProfile returns response.data; some endpoints return { data } envelope
      const profile = response?.data || response;
      if (profile) {
        setUser({
          id: profile.id || profile.userId || null,
          name: profile.full_name || profile.name || profile.user?.full_name || 'Unknown',
          email: profile.email || profile.user?.email || '',
          phone: profile.phone_number || profile.user?.phone_number || '',
          role: profile.role || 'citizen',
          avatar: profile.avatar || null,
          status: profile.status || 'online',
          lastActive: new Date(profile.lastActive || profile.last_active || Date.now()),
          permissions: profile.permissions || [],
          position: profile.position || null,
          achievements: profile.achievements || []
        });
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      setUser(null);
      toast.success('Successfully logged out');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout properly');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        setUser, 
        loading,
        logout: handleLogout,
        refreshProfile: loadUserProfile 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

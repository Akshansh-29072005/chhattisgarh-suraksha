import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('auth_token');

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the children (which in this case is usually another Navigate component)
  return children;
};

export default PublicRoute;
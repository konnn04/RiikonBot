import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Error from '../pages/Error';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) return <Navigate to="/auth/login" />;
  
  if (!isAdmin) return <Error error="Access Denied" message="You need admin permissions to access this page." />;
  
  return children;
}

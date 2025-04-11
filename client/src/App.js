import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Admin from './pages/Admin';
import PackageDetails from './pages/PackageDetails';
import Commands from './pages/Commands';
import Error from './pages/Error';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/login-failed" element={<Error error="Authentication Failed" message="There was a problem logging in with Discord." />} />
          
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/packages/:packageName" element={<PrivateRoute><PackageDetails /></PrivateRoute>} />
            <Route path="/packages/:packageName/commands" element={<PrivateRoute><Commands /></PrivateRoute>} />
            <Route path="/error" element={<Error error="Server Error" message="Something went wrong" />} />
            <Route path="*" element={<Error error="Page Not Found" message="The page you're looking for doesn't exist." />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

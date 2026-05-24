import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Login from './pages/Login';
import TermsAndConditions from './pages/TermsAndConditions';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';

// --- APP ---
function App() {
  const { token, user } = useAuth();
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/admin" element={token && user?.role === 'superadmin' ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/user_profile/:id" element={<UserProfile />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

// --- MOUNT ---
createRoot(document.getElementById('root')).render(
  <ToastProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ToastProvider>
);

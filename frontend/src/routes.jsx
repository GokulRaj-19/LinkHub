import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import DashboardView from './views/DashboardView';
import MyLinksView from './views/MyLinksView';
import StarredView from './views/StarredView';
import TeamsView from './views/TeamsView';
import TeamDetailView from './views/TeamDetailView';
import TeamLinksView from './views/TeamLinksView';
import KanbanView from './views/KanbanView';
import AppearanceView from './views/AppearanceView';
import ProfileView from './views/ProfileView';
import AdminLogsView from './views/AdminLogsView';
import Error403View from './views/Error403View';
import Error404View from './views/Error404View';
import Error500View from './views/Error500View';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="state-box">Loading LinkHub...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="state-box">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/403" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="state-box">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<GuestRoute><LoginView /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterView /></GuestRoute>} />
      
      <Route path="/dashboard" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
      <Route path="/links" element={<ProtectedRoute><MyLinksView /></ProtectedRoute>} />
      <Route path="/starred" element={<ProtectedRoute><StarredView /></ProtectedRoute>} />
      <Route path="/teams" element={<ProtectedRoute><TeamsView /></ProtectedRoute>} />
      <Route path="/teams/:id" element={<ProtectedRoute><TeamDetailView /></ProtectedRoute>} />
      <Route path="/teams/:id/links" element={<ProtectedRoute><TeamLinksView /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><KanbanView /></ProtectedRoute>} />
      <Route path="/appearance" element={<ProtectedRoute><AppearanceView /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
      
      <Route path="/admin/logs" element={<AdminRoute><AdminLogsView /></AdminRoute>} />
      
      <Route path="/403" element={<Error403View />} />
      <Route path="/500" element={<Error500View />} />
      <Route path="*" element={<Error404View />} />
    </Routes>
  );
}

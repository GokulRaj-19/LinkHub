import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import StripeBar from './components/layout/StripeBar';
import Sidebar from './components/layout/Sidebar';
import MobileTabBar from './components/layout/MobileTabBar';
import AppRoutes from './routes';

function MainLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/403', '/404', '/500'].includes(location.pathname);

  return (
    <div className="app-container">
      {user && !isAuthPage && <Sidebar />}
      <div className="main-content">
        <StripeBar />
        <main className="page-container">
          <AppRoutes />
        </main>
      </div>
      {user && !isAuthPage && <MobileTabBar />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

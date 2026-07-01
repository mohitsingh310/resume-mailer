import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedLayout } from './components/layout/Layout';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ResumesPage = lazy(() => import('./pages/ResumesPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const ComposePage = lazy(() => import('./pages/ComposePage'));
const ScheduledPage = lazy(() => import('./pages/ScheduledPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/compose" replace /> : children;
}

function Loader() {
  return <div className="flex h-screen items-center justify-center">
    <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
  </div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Navigate to="/compose" replace />} />
              <Route path="/resumes" element={<ResumesPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/compose" element={<ComposePage />} />
              <Route path="/scheduled" element={<ScheduledPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/compose" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

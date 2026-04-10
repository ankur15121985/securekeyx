import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AlgorithmSelection from './pages/AlgorithmSelection';
import KeyGeneration from './pages/KeyGeneration';
import KeyProtection from './pages/KeyProtection';
import { Toaster } from 'sonner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

export default function App() {
  return (
    <Router>
      <Toaster position="top-center" theme="dark" richColors />
      <ErrorBoundary>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/algorithms" element={
              <ProtectedRoute>
                <AlgorithmSelection />
              </ProtectedRoute>
            } />
            
            <Route path="/generate" element={
              <ProtectedRoute>
                <KeyGeneration />
              </ProtectedRoute>
            } />
            
            <Route path="/protect" element={
              <ProtectedRoute>
                <KeyProtection />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </ErrorBoundary>
    </Router>
  );
}

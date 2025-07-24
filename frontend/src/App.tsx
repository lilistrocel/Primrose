// import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { LandingPage } from './pages/LandingPage';
import { CatalogPage } from './pages/CatalogPage';
import { AdminInventoryPage } from './pages/AdminInventoryPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { ItemFormPage } from './pages/ItemFormPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen gradient-bg">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            {/* Inventory Routes */}
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/items/:id" element={<ItemDetailsPage />} />
            <Route path="/catalog/compare" element={<ComparisonPage />} />
            <Route
              path="/admin/inventory"
              element={
                <ProtectedRoute>
                  <AdminInventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inventory/create"
              element={
                <ProtectedRoute>
                  <ItemFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inventory/edit/:id"
              element={
                <ProtectedRoute>
                  <ItemFormPage />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 
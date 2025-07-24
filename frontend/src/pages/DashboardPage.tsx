import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const health = await apiService.healthCheck();
      setHealthData(health);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-effect border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-700">Primrose</h1>
              <span className="ml-4 text-gray-600">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.firstName}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="card mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.firstName}! 👋
                </h2>
                <p className="text-gray-600">
                  Here's what's happening with your Primrose application today.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-white font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">100%</h3>
              <p className="text-gray-600">Uptime</p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">1</h3>
              <p className="text-gray-600">Active Users</p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">10</h3>
              <p className="text-gray-600">Tests Passing</p>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">&lt;50ms</h3>
              <p className="text-gray-600">Response Time</p>
            </div>
          </div>

          {/* User Profile & System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Profile */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {user?.role}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">System Health</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkHealth}
                  isLoading={isLoadingHealth}
                >
                  Refresh
                </Button>
              </div>
              
              {healthData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">API Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {healthData.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Last Check</span>
                    <span className="text-sm text-gray-900">
                      {new Date(healthData.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Database</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Click refresh to check system health</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/catalog">
                <Button variant="outline" className="justify-center w-full">
                  🍎 Browse Catalog
                </Button>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/inventory">
                  <Button variant="outline" className="justify-center w-full">
                    ⚙️ Manage Inventory
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="justify-center">
                📊 View Logs
              </Button>
              <Button variant="outline" className="justify-center">
                📚 API Documentation
              </Button>
              <Button variant="outline" className="justify-center">
                Security Settings
              </Button>
              <Button variant="outline" className="justify-center">
                Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
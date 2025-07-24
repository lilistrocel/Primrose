import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-700">Primrose</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/catalog" className="text-gray-700 hover:text-primary-600 transition-colors">
                Food Catalog
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl animate-fade-in">
                  <span className="block">Build Amazing</span>
                  <span className="block text-primary-600">Web Applications</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl animate-slide-up">
                  A modern, scalable web framework with authentication, testing, and production-ready DevOps infrastructure. 
                  Built with TypeScript, React, and Node.js.
                </p>
                <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8 animate-slide-up">
                  {isAuthenticated ? (
                    <Link to="/dashboard">
                      <Button size="lg" className="w-full sm:w-auto">
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex">
                      <Link to="/register">
                        <Button size="lg" className="w-full sm:w-auto">
                          Get Started Free
                        </Button>
                      </Link>
                      <Link to="/login">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-100 opacity-50 animate-bounce-subtle"></div>
          <div className="absolute top-40 -left-40 w-60 h-60 rounded-full bg-secondary-100 opacity-30 animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-primary-200 opacity-40 animate-bounce-subtle" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to build modern apps
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Production-ready features built with best practices and security in mind.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="card text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication</h3>
                <p className="text-gray-500">Secure JWT-based authentication with bcrypt password hashing and proper session management.</p>
              </div>

              <div className="card text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 mx-auto mb-4 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Testing</h3>
                <p className="text-gray-500">Comprehensive test suite with Jest, automated CI/CD, and coverage reporting for reliable code.</p>
              </div>

              <div className="card text-center hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">DevOps</h3>
                <p className="text-gray-500">Production-ready deployment with Docker, AWS templates, monitoring, and automated security scanning.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">
              © 2024 Primrose. Built with ❤️ using modern web technologies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}; 
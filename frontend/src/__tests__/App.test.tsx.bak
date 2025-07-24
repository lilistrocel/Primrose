import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';

// Mock the API service
vi.mock('../services/api', () => ({
  apiService: {
    healthCheck: vi.fn().mockResolvedValue({ status: 'OK', timestamp: new Date().toISOString() }),
    getProfile: vi.fn().mockRejectedValue(new Error('Not authenticated')),
  },
}));

describe('App', () => {
  it('should render the landing page by default', () => {
    render(<App />);
    
    // Check if the landing page elements are present
    expect(screen.getByText('Primrose')).toBeInTheDocument();
    expect(screen.getByText('Build Amazing')).toBeInTheDocument();
    expect(screen.getByText('Web Applications')).toBeInTheDocument();
  });

  it('should show navigation elements', () => {
    render(<App />);
    
    // Check for navigation links
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });
}); 
import axios, { type AxiosInstance } from 'axios';
import type { AuthResponse, LoginCredentials, RegisterData, User, ApiError } from '../types/auth';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): ApiError {
    return {
      message: error.response?.data?.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      details: error.response?.data,
    };
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login', credentials);
    // Backend returns { success, message, data: { user, token } }
    // We need to extract the data and return { user, token }
    return response.data.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', data);
    // Backend returns { success, message, data: { user, token } }
    // We need to extract the data and return { user, token }
    return response.data.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get('/auth/profile');
    // Backend returns { success, data: { user } }
    // We need to extract the user from data
    return response.data.data.user;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await axios.get(
      (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/health'
    );
    return response.data;
  }
}

export const apiService = new ApiService(); 
// API Configuration
// Uses environment variable in production, falls back to localhost in development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    preferences: `${API_BASE_URL}/api/auth/preferences`,
  },
  routes: `${API_BASE_URL}/api/routes`,
  runs: `${API_BASE_URL}/api/runs`,
};

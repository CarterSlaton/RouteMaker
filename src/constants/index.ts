/**
 * Frontend constants
 */

export const API_CONSTANTS = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    AUTH: '/auth',
    ROUTES: '/routes',
  },
  TIMEOUT_MS: 10000,
} as const;

export const MAP_CONSTANTS = {
  DEFAULT_ZOOM: 13,
  PREVIEW_SIZE: {
    WIDTH: 300,
    HEIGHT: 200,
  },
  PADDING: 40,
  MAX_ZOOM: 15,
  ROUTE_PADDING: {
    TOP: 80,
    BOTTOM: 80,
    LEFT: 80,
    RIGHT: 80,
  },
  COLORS: {
    ROUTE_LINE: '#3182CE',
    START_MARKER: '#38A169',
    END_MARKER: '#E53E3E',
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
} as const;

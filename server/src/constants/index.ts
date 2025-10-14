/**
 * Server-wide constants
 */

export const API_CONSTANTS = {
  // Mapbox API
  MAPBOX: {
    MAX_ELEVATION_SAMPLES: 15,
    MAX_DIRECTION_WAYPOINTS: 25,
    ELEVATION_TIMEOUT_MS: 2000,
    DIRECTIONS_TIMEOUT_MS: 5000,
    SAMPLE_DELAY_MS: 50,
    TILEQUERY_API: 'https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery',
    DIRECTIONS_API: 'https://api.mapbox.com/directions/v5/mapbox/walking',
  },
} as const;

export const ROUTE_CONSTANTS = {
  MIN_DISTANCE: 0,
  DIFFICULTY_LEVELS: ['Easy', 'Moderate', 'Hard'] as const,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

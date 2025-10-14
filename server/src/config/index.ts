import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration loaded from environment variables
 */
export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
  },
  mapbox: {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN || '',
  },
} as const;

/**
 * Validate that required environment variables are set
 */
export const validateConfig = (): void => {
  const requiredVars = [
    { key: 'MONGODB_URI', value: config.mongodb.uri },
    { key: 'JWT_SECRET', value: config.jwt.secret },
  ];

  const missing = requiredVars.filter(({ value }) => !value);

  if (missing.length > 0) {
    const missingKeys = missing.map(({ key }) => key).join(', ');
    throw new Error(`Missing required environment variables: ${missingKeys}`);
  }

  // Warn about optional but recommended variables
  if (!config.mapbox.accessToken) {
    console.warn('⚠️  MAPBOX_ACCESS_TOKEN is not set. Elevation and directions features will be disabled.');
  }
};

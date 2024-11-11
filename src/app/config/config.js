require('dotenv').config();

const config = {
  app: {
    name: process.env.APP_NAME || 'secureapp',
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log',
  },

  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  azure: {
    appInsightsKey: process.env.APP_INSIGHTS_KEY,
    tenantId: process.env.AZURE_TENANT_ID,
    subscriptionId: process.env.AZURE_SUBSCRIPTION_ID,
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'secureapp',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  },
};

// Validation function for required environment variables
function validateConfig() {
  const requiredVars = {
    NODE_ENV: config.app.nodeEnv,
    JWT_SECRET: config.security.jwtSecret,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  // Validate port number
  if (isNaN(config.app.port)) {
    throw new Error('PORT must be a valid number');
  }

  // Validate rate limit values
  if (isNaN(config.security.rateLimitWindowMs) || config.security.rateLimitWindowMs <= 0) {
    throw new Error('RATE_LIMIT_WINDOW_MS must be a positive number');
  }

  if (isNaN(config.security.rateLimitMaxRequests) || config.security.rateLimitMaxRequests <= 0) {
    throw new Error('RATE_LIMIT_MAX_REQUESTS must be a positive number');
  }

  // Additional database config validation when in production
  if (config.app.isProduction) {
    if (!config.database.password) {
      throw new Error('Database password is required in production environment');
    }
  }
}

// Run validation
validateConfig();

// Freeze the configuration object to prevent modifications
Object.freeze(config);

module.exports = config;
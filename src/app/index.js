# index.js
const express = require('express');
const app = express();
const config = require('./config/config');
const routes = require('./routes/appRoutes');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const responseLogger = require('./middleware/responseLogger');

// Security middleware
app.disable('x-powered-by'); // Remove X-Powered-By header
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Parse JSON payloads
app.use(express.json());

// Add logging middleware
app.use(requestLogger);
app.use(responseLogger);

// Mount routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/asyncHandler');
const logger = require('../utils/logger');

const getHealthStatus = async () => {
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  };

  // Add additional health checks here (e.g., database connection)
  try {
    // Example: Check database connection
    // await db.query('SELECT 1');
    status.database = 'connected';
  } catch (error) {
    status.database = 'disconnected';
    status.status = 'degraded';
  }

  return status;
};

router.get('/health', asyncHandler(async (req, res) => {
  logger.info('Processing health check request');
  const healthStatus = await getHealthStatus();
  
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
}));

module.exports = router; 
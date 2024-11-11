const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  // Log the incoming request
  logger.logRequest(req);

  // Track response time
  const start = process.hrtime();

  // Log when the response is finished
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const responseTime = seconds * 1000 + nanoseconds / 1000000;

    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`
    });
  });

  next();
}

module.exports = requestLogger; 
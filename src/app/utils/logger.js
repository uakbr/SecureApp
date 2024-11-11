const { createLogger, format, transports } = require('winston');
const config = require('../config/config');
const path = require('path');

// Custom format for detailed error logging
const errorFormat = format(info => {
  if (info instanceof Error) {
    return Object.assign({}, info, {
      stack: info.stack,
      message: info.message
    });
  }
  return info;
});

// Custom format for request logging
const requestFormat = format(info => {
  if (info.request) {
    return Object.assign({}, info, {
      request: {
        method: info.request.method,
        url: info.request.url,
        headers: info.request.headers,
        body: info.request.body,
      }
    });
  }
  return info;
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.dirname(config.logging.filePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = createLogger({
  level: config.logging.level,
  format: format.combine(
    errorFormat(),
    requestFormat(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    config.logging.format === 'json'
      ? format.json()
      : format.printf(({ timestamp, level, message, metadata }) => {
          const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
          return `${timestamp} [${level.toUpperCase()}]: ${message} ${meta}`;
        })
  ),
  transports: [
    // Console transport
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, metadata }) => {
          const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
          return `${timestamp} [${level}]: ${message} ${meta}`;
        })
      )
    }),
    // File transport for all logs
    new transports.File({
      filename: config.logging.filePath,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    // Separate file for error logs
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Add request logging helper
logger.logRequest = (req, message = 'Incoming request') => {
  logger.info(message, {
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      ip: req.ip,
      userId: req.user?.id // If user authentication is implemented
    }
  });
};

// Add response logging helper
logger.logResponse = (res, message = 'Outgoing response') => {
  logger.info(message, {
    response: {
      statusCode: res.statusCode,
      headers: res.getHeaders(),
      body: res._responseBody // Note: Need to implement body capturing middleware
    }
  });
};

// Add error logging helper
logger.logError = (error, req = null) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    code: error.code,
    name: error.name
  };

  if (req) {
    errorLog.request = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      ip: req.ip
    };
  }

  logger.error('Error occurred', errorLog);
};

// Development vs Production logging
if (config.app.isDevelopment) {
  logger.debug('Debug logging enabled');
} else {
  // Add any production-specific logging configuration
  logger.info('Production logging configured');
}

module.exports = logger;
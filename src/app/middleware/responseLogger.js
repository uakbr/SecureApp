const logger = require('../utils/logger');

function responseLogger(req, res, next) {
  // Store original end function
  const originalEnd = res.end;
  const chunks = [];

  // Override end function
  res.end = function(chunk) {
    if (chunk) {
      chunks.push(Buffer.from(chunk));
    }
    
    // Restore body for logging
    const body = Buffer.concat(chunks).toString('utf8');
    res._responseBody = body;

    // Log the response
    logger.logResponse(res);

    // Call original end function
    originalEnd.apply(res, arguments);
  };

  next();
}

module.exports = responseLogger; 
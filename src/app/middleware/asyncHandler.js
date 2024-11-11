const logger = require('../utils/logger');

/**
 * Wraps async route handlers to handle rejected promises
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped route handler
 */
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(error => {
      logger.error('Async handler caught error:', error);
      next(error);
    });
};

module.exports = {
  asyncHandler
}; 
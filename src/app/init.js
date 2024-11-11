const logger = require('./utils/logger');
const config = require('./config/config');
const ConfigValidator = require('./utils/configValidator');

async function initializeApp() {
  try {
    // Load and validate environment variables
    require('dotenv').config();
    
    // Additional validation using the validator utility
    ConfigValidator.validateNodeEnv(config.app.nodeEnv);
    ConfigValidator.validatePort(config.app.port);
    ConfigValidator.validateLogLevel(config.logging.level);
    
    // Log initialization status
    logger.info('Configuration loaded successfully');
    logger.info(`Environment: ${config.app.nodeEnv}`);
    logger.info(`Server will run on port ${config.app.port}`);
    
    if (config.app.isDevelopment) {
      logger.debug('Configuration:', JSON.stringify(config, null, 2));
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    return false;
  }
}

module.exports = initializeApp; 
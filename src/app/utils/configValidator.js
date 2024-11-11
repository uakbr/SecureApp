const logger = require('./logger');

class ConfigValidator {
  static validatePort(port) {
    const numPort = parseInt(port, 10);
    if (isNaN(numPort) || numPort <= 0 || numPort > 65535) {
      throw new Error('Port must be a number between 1 and 65535');
    }
    return numPort;
  }

  static validateNodeEnv(env) {
    const validEnvs = ['development', 'production', 'test'];
    if (!validEnvs.includes(env)) {
      throw new Error(`NODE_ENV must be one of: ${validEnvs.join(', ')}`);
    }
    return env;
  }

  static validateLogLevel(level) {
    const validLevels = ['error', 'warn', 'info', 'debug'];
    if (!validLevels.includes(level)) {
      logger.warn(`Invalid log level "${level}", defaulting to "info"`);
      return 'info';
    }
    return level;
  }

  static validateUrl(url, allowEmpty = false) {
    if (!url && allowEmpty) {
      return url;
    }
    try {
      new URL(url);
      return url;
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`);
    }
  }

  static validatePositiveNumber(value, name) {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      throw new Error(`${name} must be a positive number`);
    }
    return num;
  }
}

module.exports = ConfigValidator; 
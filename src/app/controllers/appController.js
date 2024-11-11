# appController.js

const logger = require('../utils/logger');
const { validateRequestBody } = require('../utils/validators');

class AppController {
  // GET /api
  static async getIndex(req, res) {
    try {
      logger.info('Processing index request');
      res.status(200).json({
        message: 'Welcome to SecureApp API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in getIndex:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // POST /api/data
  static async postData(req, res) {
    try {
      logger.info('Processing data submission');

      // Validate request body
      const validationResult = validateRequestBody(req.body);
      if (!validationResult.isValid) {
        logger.warn('Invalid request body:', validationResult.errors);
        return res.status(400).json({
          error: 'Validation Error',
          details: validationResult.errors
        });
      }

      // Process the data
      const processedData = {
        ...req.body,
        processedAt: new Date().toISOString()
      };

      logger.info('Data processed successfully');
      res.status(201).json({
        message: 'Data received and processed',
        data: processedData
      });
    } catch (error) {
      logger.error('Error in postData:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AppController;
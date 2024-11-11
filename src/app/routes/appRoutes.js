# appRoutes.js
const express = require('express');
const router = express.Router();
const AppController = require('../controllers/appController');
const { asyncHandler } = require('../middleware/asyncHandler');

// Wrap controller methods with asyncHandler for consistent error handling
router.get('/', asyncHandler(AppController.getIndex));
router.post('/data', asyncHandler(AppController.postData));

module.exports = router;
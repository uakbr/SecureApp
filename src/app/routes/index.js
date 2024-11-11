const express = require('express');
const router = express.Router();
const appRoutes = require('./appRoutes');
const healthRoutes = require('./healthRoutes');

// Mount all routes
router.use('/', appRoutes);
router.use('/', healthRoutes);

module.exports = router; 
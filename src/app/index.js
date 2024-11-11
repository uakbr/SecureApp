# index.js
const express = require('express');
const app = express();
const config = require('./config/config');
const routes = require('./routes/appRoutes');
const logger = require('./utils/logger');

// Middleware setup
app.use(express.json());
app.use('/api', routes);

// Start the server
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

module.exports = app;
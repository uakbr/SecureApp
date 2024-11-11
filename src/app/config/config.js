require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  appInsightsKey: process.env.APP_INSIGHTS_KEY || '',
  // Add other configurations as needed
};
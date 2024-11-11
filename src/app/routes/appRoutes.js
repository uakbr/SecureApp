# appRoutes.js
const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');

router.get('/', appController.getIndex);
router.post('/data', appController.postData);

module.exports = router;
const express = require('express');
const router = express.Router();
const SubscriptionController = require('../controllers/SubscriptionController');
const authMiddleware = require('../middleware/authMiddleware');

// User subscription routes
router.get('/', authMiddleware.requireAuth, SubscriptionController.getUserSubscriptions);

module.exports = router;
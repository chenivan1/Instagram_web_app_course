const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const authMiddleware = require('../middleware/authMiddleware');

// Feed routes
router.get('/', authMiddleware.requireAuth, PostController.getHomeFeed);

module.exports = router;
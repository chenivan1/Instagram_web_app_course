const express = require('express');
const router = express.Router();
const NewsController = require('../controllers/NewsController');

// Route to render the news page
router.get('/', NewsController.renderNewsPage);

// Route to get news data as JSON
router.get('/api', NewsController.getNews);

module.exports = router; 
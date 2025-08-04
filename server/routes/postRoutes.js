const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const authMiddleware = require('../middleware/authMiddleware');

// Post CRUD routes
router.post('/', authMiddleware.requireAuth, PostController.createPost);
router.get('/my', authMiddleware.requireAuth, PostController.getUserPosts);
router.get('/:id', authMiddleware.requireAuth, PostController.getPostById);
router.put('/:id', authMiddleware.requireAuth, PostController.updatePost);
router.delete('/:id', authMiddleware.requireAuth, PostController.deletePost);

module.exports = router;
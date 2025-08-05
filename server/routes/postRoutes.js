const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const authMiddleware = require('../middleware/authMiddleware');

// Post CRUD routes
router.post('/', authMiddleware.requireAuth, PostController.createPost);
router.get('/search', authMiddleware.requireAuth, PostController.searchPosts);
router.get('/my', authMiddleware.requireAuth, PostController.getUserPosts);
router.get('/:id', authMiddleware.requireAuth, PostController.getPostById);
router.put('/:id', authMiddleware.requireAuth, PostController.updatePost);
router.delete('/:id', authMiddleware.requireAuth, PostController.deletePost);

// Like and comment routes
router.post('/:id/like', authMiddleware.requireAuth, PostController.toggleLike);
router.post('/:id/comments', authMiddleware.requireAuth, PostController.addComment);
router.get('/:id/comments', authMiddleware.requireAuth, PostController.getComments);
router.put('/:postId/comments/:commentId', authMiddleware.requireAuth, PostController.updateComment);
router.delete('/:postId/comments/:commentId', authMiddleware.requireAuth, PostController.deleteComment);

module.exports = router;
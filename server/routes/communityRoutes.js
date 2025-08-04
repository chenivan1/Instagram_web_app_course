const express = require('express');
const router = express.Router();
const CommunityController = require('../controllers/CommunityController');
const SubscriptionController = require('../controllers/SubscriptionController');
const PostController = require('../controllers/PostController');
const authMiddleware = require('../middleware/authMiddleware');

// Community CRUD routes
router.get('/', authMiddleware.requireAuth, CommunityController.getAllCommunities);
router.get('/managed', authMiddleware.requireAuth, CommunityController.getManagedCommunities);
router.get('/:id', authMiddleware.requireAuth, CommunityController.getCommunityById);
router.post('/', authMiddleware.requireAuth, CommunityController.createCommunity);
router.put('/:id', authMiddleware.requireAuth, CommunityController.updateCommunity);

// Community posts routes
router.get('/:id/posts', authMiddleware.requireAuth, PostController.getCommunityPosts);

// Community subscription routes
router.post('/:id/subscribe', authMiddleware.requireAuth, SubscriptionController.subscribeToCommunity);
router.delete('/:id/unsubscribe', authMiddleware.requireAuth, SubscriptionController.unsubscribeFromCommunity);
router.get('/:id/subscription-status', authMiddleware.requireAuth, SubscriptionController.checkSubscriptionStatus);
router.get('/:id/subscribers', authMiddleware.requireAuth, CommunityController.getCommunitySubscribers);

module.exports = router;
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', UserController.getAllUsers);
router.post('/', UserController.createUser);
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.post('/logout', UserController.logoutUser);

// User Management routes (admin only) - Put specific routes BEFORE parameterized routes
router.get('/user-management', authMiddleware.requireAuth, UserController.getUserManagementPage);
router.get('/search', UserController.searchUsers);
router.get('/current', UserController.getCurrentUser);
router.delete('/manage/:id', UserController.deleteUserById);
router.put('/toggle-role/:id', UserController.toggleUserRole);

// Parameterized routes MUST come last to avoid conflicts
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router; 
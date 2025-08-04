const express = require('express');
const router = express.Router();
const AddressesController = require('../controllers/AddressesController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to render the addresses map page
router.get('/', authMiddleware.requireAuth, AddressesController.renderAddressesPage);

module.exports = router; 
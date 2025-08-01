const express = require('express');
const router = express.Router();
const AddressesController = require('../controllers/AddressesController');

// Route to render the addresses map page
router.get('/', AddressesController.renderAddressesPage);

// Route to get addresses data as JSON
router.get('/api', AddressesController.getAddresses);

module.exports = router; 
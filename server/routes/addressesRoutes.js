const express = require('express');
const router = express.Router();
const AddressesController = require('../controllers/AddressesController');

// Route to render the addresses map page
router.get('/', AddressesController.renderAddressesPage);

module.exports = router; 
const path = require('path');

const AddressesController = {    
    async renderAddressesPage(_, res) {
        try {
            // Send the HTML page
            res.sendFile(path.join(__dirname, '../views/addresses/addresses.html'));
        } catch (error) {
            console.error('Error rendering addresses page:', error);
            res.status(500).send('Error loading addresses page');
        }
    }
}

module.exports = AddressesController; 
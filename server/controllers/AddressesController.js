const path = require('path');

const AddressesController = {
    async getAddresses(req, res) {
        try {
            // Hardcoded list of addresses with coordinates
            const addresses = [
                {
                    id: 1,
                    name: "John Doe",
                    address: "123 Main Street, New York, NY 10001",
                    lat: 40.7128,
                    lng: -74.0060,
                    description: "John's home address"
                },
                {
                    id: 2,
                    name: "Jane Smith",
                    address: "456 Oak Avenue, Los Angeles, CA 90210",
                    lat: 34.0522,
                    lng: -118.2437,
                    description: "Jane's apartment"
                },
                {
                    id: 3,
                    name: "Mike Johnson",
                    address: "789 Pine Street, Chicago, IL 60601",
                    lat: 41.8781,
                    lng: -87.6298,
                    description: "Mike's office"
                },
                {
                    id: 4,
                    name: "Sarah Wilson",
                    address: "321 Elm Road, Miami, FL 33101",
                    lat: 25.7617,
                    lng: -80.1918,
                    description: "Sarah's vacation home"
                },
                {
                    id: 5,
                    name: "David Brown",
                    address: "654 Maple Drive, Seattle, WA 98101",
                    lat: 47.6062,
                    lng: -122.3321,
                    description: "David's condo"
                }
            ];
            
            res.json({ addresses });
        } catch (error) {
            console.error('Error fetching addresses:', error);
            res.status(500).json({ error: 'Failed to fetch addresses data' });
        }
    },
    
    async renderAddressesPage(req, res) {
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
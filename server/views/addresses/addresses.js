let map;
let markers = [];
let addresses = [];

// Function to check if Google Maps API is loaded
function isGoogleMapsLoaded() {
    return typeof google !== 'undefined' && google.maps && google.maps.Map;
}

// Initialize the map
function initMap() {
    // Default center (United States)
    const defaultCenter = { lat: 39.8283, lng: -98.5795 };
    
    // Create the map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: defaultCenter,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });
    
    // Hide loading indicator
    document.getElementById('loading').style.display = 'none';
    
    // Fetch addresses data
    fetchAddresses();
}

// Function to fetch addresses data using AJAX
function fetchAddresses() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/addresses/api', true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                addresses = data.addresses || [];
                displayAddresses();
                addMarkersToMap();
            } catch (error) {
                showError('Error parsing addresses data');
            }
        } else {
            showError('Failed to fetch addresses data');
        }
    };
    
    xhr.onerror = function() {
        showError('Network error occurred');
    };
    
    xhr.send();
}

// Function to create address card HTML
function createAddressCard(address) {
    return `
        <div class="address-card" data-address-id="${address.id}" onclick="focusOnMarker(${address.id})">
            <div class="address-name">${address.name}</div>
            <div class="address-text">${address.address}</div>
            <div class="address-description">${address.description}</div>
        </div>
    `;
}

// Function to display addresses in the sidebar
function displayAddresses() {
    const container = document.getElementById('addresses-container');
    
    if (addresses.length > 0) {
        const addressesHTML = addresses.map(address => createAddressCard(address)).join('');
        container.innerHTML = addressesHTML;
    } else {
        showError('No addresses available');
    }
}

// Function to add markers to the map
function addMarkersToMap() {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    addresses.forEach(address => {
        const marker = new google.maps.Marker({
            position: { lat: address.lat, lng: address.lng },
            map: map,
            title: address.name,
            animation: google.maps.Animation.DROP
        });
        
        // Create info window content
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; max-width: 200px;">
                    <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${address.name}</h4>
                    <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">${address.address}</p>
                    <p style="margin: 0; color: #888; font-size: 11px; font-style: italic;">${address.description}</p>
                </div>
            `
        });
        
        // Add click listener to marker
        marker.addListener('click', function() {
            infoWindow.open(map, marker);
            highlightAddressCard(address.id);
        });
        
        // Store marker reference
        markers.push(marker);
    });
    
    // Fit map to show all markers
    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds);
        
        // If only one marker, zoom in a bit more
        if (markers.length === 1) {
            map.setZoom(12);
        }
    }
}

// Function to focus on a specific marker
function focusOnMarker(addressId) {
    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
        const marker = markers.find(m => 
            m.getPosition().lat() === address.lat && 
            m.getPosition().lng() === address.lng
        );
        
        if (marker) {
            // Center map on marker
            map.setCenter(marker.getPosition());
            map.setZoom(14);
            
            // Trigger marker click to show info window
            google.maps.event.trigger(marker, 'click');
            
            // Highlight the address card
            highlightAddressCard(addressId);
        }
    }
}

// Function to highlight address card
function highlightAddressCard(addressId) {
    // Remove active class from all cards
    document.querySelectorAll('.address-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to selected card
    const selectedCard = document.querySelector(`[data-address-id="${addressId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Function to show error
function showError(message) {
    const container = document.getElementById('addresses-container');
    container.innerHTML = `
        <div class="error">
            <p>${message}</p>
            <button onclick="fetchAddresses()">Try Again</button>
        </div>
    `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadGoogleMapsAPI();
});

// Function to load Google Maps API with the API key from server
function loadGoogleMapsAPI() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/maps-key', true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                const apiKey = data.apiKey;
                
                // Load Google Maps API with the retrieved key
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
                script.async = true;
                script.defer = true;
                script.onload = function() {
                    initializeMapWhenReady();
                };
                script.onerror = function() {
                    handleMapError();
                };
                document.head.appendChild(script);
                
            } catch (error) {
                console.error('Error parsing API key response:', error);
                handleMapError();
            }
        } else {
            console.error('Failed to fetch API key');
            handleMapError();
        }
    };
    
    xhr.onerror = function() {
        console.error('Network error fetching API key');
        handleMapError();
    };
    
    xhr.send();
}

// Function to initialize map when Google Maps API is ready
function initializeMapWhenReady() {
    if (isGoogleMapsLoaded()) {
        initMap();
    } 
}

// Handle Google Maps API loading error
function handleMapError() {
    document.getElementById('loading').innerHTML = `
        <div class="error">
            <p>Failed to load Google Maps. Please check your API key configuration.</p>
            <button onclick="location.reload()">Reload Page</button>
        </div>
    `;
} 
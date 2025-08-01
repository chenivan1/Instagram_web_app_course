let map;
let markers = [];
let infoWindows = [];
let users = [];

// Function to check if Google Maps API is loaded
function isGoogleMapsLoaded() {
    return typeof google !== 'undefined' && google.maps && google.maps.Map;
}

// Initialize the map
function initMap() {
    const defaultCenter = { lat: 39.8283, lng: -98.5795 };
    
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
    
    document.getElementById('loading').style.display = 'none';
    
    fetchUsers();
}

// Function to fetch addresses data using AJAX
function fetchUsers() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/user', true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                users = data || [];
                displayUsersAddresses();
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
function createUserAddressCard(user) {
    return `
        <div class="address-card" data-address-id="${user.id}" onclick="focusOnMarker('${user.id}')">
            <div class="address-name">${user.name}</div>
            <div class="address-text">${user.address.name}</div>
        </div>
    `;
}

// Function to display addresses in the sidebar
function displayUsersAddresses() {
    const container = document.getElementById('addresses-container');
    
    if (users.length > 0) {
        const usersAddressesHTML = users.map(user => createUserAddressCard(user)).join('');
        container.innerHTML = usersAddressesHTML;
    } else {
        showError('No users addresses available');
    }
}

// Function to add markers to the map
function addMarkersToMap() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    infoWindows = [];
    
    users.forEach(user => {
        const marker = new google.maps.Marker({
            position: { lat: user.address.lat, lng: user.address.lng },
            map: map,
            title: user.address.name,
            animation: google.maps.Animation.DROP
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; max-width: 200px;">
                    <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${user.address.name}</h4>
                </div>
            `
        });
        
        marker.addListener('click', function() {
            infoWindows.forEach(window => window.close());
            infoWindow.open(map, marker);
            highlightUserAddressCard(user.id);
        });
        
        // Store marker and info window references
        markers.push(marker);
        infoWindows.push(infoWindow);
    });
    
    if (markers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds);
        
        if (markers.length === 1) {
            map.setZoom(12);
        }
    }
}

// Function to focus on a specific marker
function focusOnMarker(addressId) {
    const user = users.find(user => user.id === addressId);
    if (user) {
        const markerIndex = users.findIndex(u => u.id === addressId);
        const marker = markers[markerIndex];
        const infoWindow = infoWindows[markerIndex];
        
        if (marker && infoWindow) {
            map.setCenter(marker.getPosition());
            map.setZoom(14);
            
            infoWindows.forEach(window => window.close());
            infoWindow.open(map, marker);
            
            highlightUserAddressCard(addressId);
        }
    }
}

// Function to highlight address card
function highlightUserAddressCard(userId) {
    document.querySelectorAll('.address-card').forEach(card => {
        card.classList.remove('active');
    });
    
    const selectedCard = document.querySelector(`[data-address-id="${userId}"]`);
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
// Communities Page JavaScript

let allCommunities = [];
let subscribedCommunities = [];
let managedCommunities = [];
let userSubscriptions = new Set();

// DOM Elements
const allCommunitiesList = document.getElementById('allCommunitiesList');
const subscribedCommunitiesList = document.getElementById('subscribedCommunitiesList');
const managedCommunitiesList = document.getElementById('managedCommunitiesList');
const searchInput = document.getElementById('searchInput');
const createCommunityBtn = document.getElementById('createCommunityBtn');
const editCommunityBtn = document.getElementById('editCommunityBtn');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadAllCommunities();
    setupEventListeners();
    
    // Tab switching
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            const target = event.target.getAttribute('data-bs-target');
            if (target === '#my-subscriptions') {
                loadSubscribedCommunities();
            } else if (target === '#managed-communities') {
                loadManagedCommunities();
            }
        });
    });
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterCommunities, 300));
    }
    
    // Create community
    if (createCommunityBtn) {
        createCommunityBtn.addEventListener('click', function(e) {
            e.preventDefault();
            createCommunity();
        });
    }
    
    // Edit community
    if (editCommunityBtn) {
        editCommunityBtn.addEventListener('click', updateCommunity);
    }
    
    // Form validation
    const communityNameInput = document.getElementById('communityName');
    const editCommunityNameInput = document.getElementById('editCommunityName');
    
    if (communityNameInput) {
        communityNameInput.addEventListener('input', validateCommunityName);
    }
    if (editCommunityNameInput) {
        editCommunityNameInput.addEventListener('input', validateEditCommunityName);
    }
}

// Load all communities
function loadAllCommunities() {
    showLoading(allCommunitiesList);
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/communities', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                allCommunities = JSON.parse(xhr.responseText);
                loadUserSubscriptions().then(() => {
                    displayCommunities(allCommunities, allCommunitiesList, 'all');
                });
            } else {
                showError(allCommunitiesList, 'Failed to load communities');
            }
        }
    };
    xhr.send();
}

// Load user subscriptions
function loadUserSubscriptions() {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/subscriptions', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const subscriptions = JSON.parse(xhr.responseText);
                    userSubscriptions = new Set(subscriptions.map(sub => sub.id));
                }
                resolve();
            }
        };
        xhr.send();
    });
}

// Load subscribed communities
function loadSubscribedCommunities() {
    showLoading(subscribedCommunitiesList);
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/subscriptions', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                subscribedCommunities = JSON.parse(xhr.responseText);
                displayCommunities(subscribedCommunities, subscribedCommunitiesList, 'subscribed');
            } else {
                showError(subscribedCommunitiesList, 'Failed to load subscribed communities');
            }
        }
    };
    xhr.send();
}

// Load managed communities
function loadManagedCommunities() {
    showLoading(managedCommunitiesList);
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/communities/managed', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                managedCommunities = JSON.parse(xhr.responseText);
                displayCommunities(managedCommunities, managedCommunitiesList, 'managed');
            } else {
                showError(managedCommunitiesList, 'Failed to load managed communities');
            }
        }
    };
    xhr.send();
}

// Display communities
function displayCommunities(communities, container, type) {
    if (communities.length === 0) {
        showEmptyState(container, type);
        return;
    }
    
    container.innerHTML = '';
    communities.forEach(community => {
        const communityCard = createCommunityCard(community, type);
        container.appendChild(communityCard);
    });
}

// Create community card
function createCommunityCard(community, type) {
    const div = document.createElement('div');
    div.className = 'col-md-6 col-lg-4';
    
    const isSubscribed = userSubscriptions.has(community.id);
    const isManaged = type === 'managed';
    
    div.innerHTML = `
        <div class="community-card">
            <div class="community-info">
                <div class="community-name">${escapeHtml(community.name)}</div>
                <div class="community-manager">Managed by ${escapeHtml(community.managerName)}</div>
                ${community.description ? `<div class="community-description">${escapeHtml(community.description)}</div>` : ''}
            </div>
            <div class="community-actions">
                ${getActionButtons(community, isSubscribed, isManaged)}
            </div>
        </div>
    `;
    
    return div;
}

// Get action buttons based on community status
function getActionButtons(community, isSubscribed, isManaged) {
    let buttons = '';
    
    if (isManaged) {
        buttons += `
            <button class="btn btn-manage" onclick="editCommunityModal('${community.id}')">
                Edit Community
            </button>
            <button class="btn btn-statistics" onclick="window.location.href='/communities/statistics/page'" title="View Statistics">
                <i class="fas fa-chart-bar"></i> Stats
            </button>
        `;
    } else {
        if (isSubscribed) {
            buttons += `
                <button class="btn btn-unsubscribe" onclick="unsubscribeFromCommunity('${community.id}')">
                    Unsubscribe
                </button>
            `;
        } else {
            buttons += `
                <button class="btn btn-subscribe" onclick="subscribeToCommunity('${community.id}')">
                    Subscribe
                </button>
            `;
        }
    }
    
    return buttons;
}

// Subscribe to community
function subscribeToCommunity(communityId) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/communities/${communityId}/subscribe`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                showAlert('Successfully subscribed to community!', 'success');
                userSubscriptions.add(communityId);
                loadAllCommunities(); // Refresh the display
            } else {
                const error = JSON.parse(xhr.responseText);
                showAlert(error.error || 'Failed to subscribe', 'danger');
            }
        }
    };
    xhr.send();
}

// Unsubscribe from community
function unsubscribeFromCommunity(communityId) {
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `/communities/${communityId}/unsubscribe`, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                showAlert('Successfully unsubscribed from community!', 'success');
                userSubscriptions.delete(communityId);
                loadAllCommunities(); // Refresh the display
                // Refresh subscribed communities tab if active
                const activeTab = document.querySelector('.nav-link.active');
                if (activeTab && activeTab.getAttribute('data-bs-target') === '#my-subscriptions') {
                    loadSubscribedCommunities();
                }
            } else {
                const error = JSON.parse(xhr.responseText);
                showAlert(error.error || 'Failed to unsubscribe', 'danger');
            }
        }
    };
    xhr.send();
}

// Create community
function createCommunity() {
    const submitButton = document.getElementById('createCommunityBtn');
    
    // Prevent multiple submissions
    if (submitButton.disabled) {
        return;
    }
    
    const name = document.getElementById('communityName').value.trim();
    const description = document.getElementById('communityDescription').value.trim();
    
    // Clear previous validation errors
    document.getElementById('communityName').classList.remove('is-invalid');
    document.getElementById('nameError').textContent = '';
    
    if (!validateCommunityName()) {
        return;
    }
    
    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Creating...';
    
    const data = { name, description };
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/communities', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = 'Create Community';
            
            if (xhr.status === 201) {
                try {
                    const result = JSON.parse(xhr.responseText);
                    showAlert('Community created successfully!', 'success');
                    
                    // Close modal and reset form
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createCommunityModal'));
                    if (modal) {
                        modal.hide();
                    }
                    document.getElementById('createCommunityForm').reset();
                    
                    // Refresh communities
                    loadAllCommunities();
                    userSubscriptions.add(result.community.id);
                } catch (e) {
                    console.error('Error parsing success response:', e);
                    showAlert('Community created but failed to update display', 'warning');
                }
            } else {
                try {
                    const error = JSON.parse(xhr.responseText);
                    showAlert(error.error || 'Failed to create community', 'danger');
                    
                    if (error.error && error.error.includes('already exists')) {
                        document.getElementById('communityName').classList.add('is-invalid');
                        document.getElementById('nameError').textContent = error.error;
                    }
                } catch (e) {
                    console.error('Error parsing error response:', e);
                    showAlert('Failed to create community', 'danger');
                }
            }
        }
    };
    
    xhr.onerror = function() {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = 'Create Community';
        showAlert('Network error occurred', 'danger');
    };
    
    xhr.send(JSON.stringify(data));
}

// Edit community modal
function editCommunityModal(communityId) {
    const community = allCommunities.find(c => c.id === communityId) || 
                     managedCommunities.find(c => c.id === communityId);
    
    if (!community) return;
    
    document.getElementById('editCommunityId').value = community.id;
    document.getElementById('editCommunityName').value = community.name;
    document.getElementById('editCommunityDescription').value = community.description || '';
    
    const modal = new bootstrap.Modal(document.getElementById('editCommunityModal'));
    modal.show();
}

// Update community
function updateCommunity() {
    const id = document.getElementById('editCommunityId').value;
    const name = document.getElementById('editCommunityName').value.trim();
    const description = document.getElementById('editCommunityDescription').value.trim();
    
    if (!validateEditCommunityName()) {
        return;
    }
    
    const data = { name, description };
    
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `/communities/${id}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                showAlert('Community updated successfully!', 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editCommunityModal'));
                modal.hide();
                
                // Refresh communities
                loadAllCommunities();
                loadManagedCommunities();
            } else {
                const error = JSON.parse(xhr.responseText);
                showAlert(error.error || 'Failed to update community', 'danger');
                
                if (error.error && error.error.includes('already exists')) {
                    document.getElementById('editCommunityName').classList.add('is-invalid');
                    document.getElementById('editNameError').textContent = error.error;
                }
            }
        }
    };
    xhr.send(JSON.stringify(data));
}

// View subscribers
function viewSubscribers(communityId) {
    const community = managedCommunities.find(c => c.id === communityId);
    if (!community) return;
    
    document.getElementById('subscribersModalTitle').textContent = `${community.name} - Subscribers`;
    const subscribersList = document.getElementById('subscribersList');
    showLoading(subscribersList);
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/communities/${communityId}/subscribers`, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const subscribers = JSON.parse(xhr.responseText);
                displaySubscribers(subscribers, subscribersList);
            } else {
                showError(subscribersList, 'Failed to load subscribers');
            }
        }
    };
    xhr.send();
    
    const modal = new bootstrap.Modal(document.getElementById('subscribersModal'));
    modal.show();
}

// Display subscribers
function displaySubscribers(subscribers, container) {
    if (subscribers.length === 0) {
        container.innerHTML = '<div class="empty-state">No subscribers yet</div>';
        return;
    }
    
    container.innerHTML = '';
    subscribers.forEach(subscriber => {
        const div = document.createElement('div');
        div.className = 'subscriber-item';
        
        const subscribeDate = new Date(subscriber.subscribedAt).toLocaleDateString();
        
        div.innerHTML = `
            <div class="subscriber-info">
                <div class="subscriber-name">User ID: ${subscriber.userId}</div>
                <div class="subscriber-date">Subscribed on ${subscribeDate}</div>
            </div>
        `;
        
        container.appendChild(div);
    });
}

// View community posts
function viewCommunityPosts(communityId) {
    window.location.href = `/communities/${communityId}/posts`;
}

// Filter communities (search)
function filterCommunities() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        displayCommunities(allCommunities, allCommunitiesList, 'all');
        return;
    }
    
    const filtered = allCommunities.filter(community => 
        community.name.toLowerCase().includes(query) ||
        community.managerName.toLowerCase().includes(query) ||
        (community.description && community.description.toLowerCase().includes(query))
    );
    
    displayCommunities(filtered, allCommunitiesList, 'all');
}

// Validation functions
function validateCommunityName() {
    const input = document.getElementById('communityName');
    const error = document.getElementById('nameError');
    const name = input.value.trim();
    
    input.classList.remove('is-invalid');
    error.textContent = '';
    
    if (name.length < 3) {
        input.classList.add('is-invalid');
        error.textContent = 'Community name must be at least 3 characters';
        return false;
    }
    
    if (name.length > 50) {
        input.classList.add('is-invalid');
        error.textContent = 'Community name must not exceed 50 characters';
        return false;
    }
    
    return true;
}

function validateEditCommunityName() {
    const input = document.getElementById('editCommunityName');
    const error = document.getElementById('editNameError');
    const name = input.value.trim();
    
    input.classList.remove('is-invalid');
    error.textContent = '';
    
    if (name.length < 3) {
        input.classList.add('is-invalid');
        error.textContent = 'Community name must be at least 3 characters';
        return false;
    }
    
    if (name.length > 50) {
        input.classList.add('is-invalid');
        error.textContent = 'Community name must not exceed 50 characters';
        return false;
    }
    
    return true;
}

// Utility functions
function showLoading(container) {
    container.innerHTML = '<div class="loading"><div class="spinner-border" role="status"></div><p class="mt-2">Loading...</p></div>';
}

function showError(container, message) {
    container.innerHTML = `<div class="empty-state"><h4>Error</h4><p>${message}</p></div>`;
}

function showEmptyState(container, type) {
    let message = '';
    switch(type) {
        case 'all':
            message = 'No communities found';
            break;
        case 'subscribed':
            message = 'You haven\'t subscribed to any communities yet';
            break;
        case 'managed':
            message = 'You haven\'t created any communities yet';
            break;
        default:
            message = 'No communities found';
    }
    
    container.innerHTML = `<div class="empty-state"><h4>No Communities</h4><p>${message}</p></div>`;
}

function showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alert, container.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
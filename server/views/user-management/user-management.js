// User Management JavaScript
let currentUsers = [];
let deleteModal;

// Helper function to make XMLHttpRequests
function makeRequest(method, url, data = null) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        
        if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
            xhr.setRequestHeader('Content-Type', 'application/json');
        }
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        resolve(xhr.responseText);
                    }
                } else {
                    let errorResponse;
                    try {
                        errorResponse = JSON.parse(xhr.responseText);
                    } catch (e) {
                        errorResponse = { error: 'Request failed' };
                    }
                    reject({ status: xhr.status, response: errorResponse, xhr: xhr });
                }
            }
        };
        
        xhr.onerror = function() {
            reject({ status: 0, response: { error: 'Network error' }, xhr: xhr });
        };
        
        if (data) {
            xhr.send(JSON.stringify(data));
        } else {
            xhr.send();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initializeUserManagement();
});

function initializeUserManagement() {
    // Initialize Bootstrap modal
    const deleteModalElement = document.getElementById('deleteModal');
    if (deleteModalElement) {
        deleteModal = new bootstrap.Modal(deleteModalElement);
    }
    
    // Attach event listeners
    attachEventListeners();
    
    // Load all users initially
    searchUsers('');
}

function attachEventListeners() {
    // Search functionality
    const clearBtn = document.getElementById('clearBtn');
    const searchInput = document.getElementById('userSearch');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClear);
    }
    
    if (searchInput) {
        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        
        // Real-time search with debounce
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch();
            }, 300);
        });
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

function handleSearch() {
    const searchInput = document.getElementById('userSearch');
    const query = searchInput ? searchInput.value.trim() : '';
    searchUsers(query);
}

function handleClear() {
    const searchInput = document.getElementById('userSearch');
    if (searchInput) {
        searchInput.value = '';
    }
    searchUsers('');
}

function searchUsers(query) {
    showLoading(true);
    hideMessages();
    
    const url = query ? `/user/search?query=${encodeURIComponent(query)}` : '/user/search';
    
    makeRequest('GET', url)
        .then(function(users) {
            currentUsers = users;
            displayUsers(users);
            updateUserCount(users.length);
            showLoading(false);
        })
        .catch(function(error) {
            showLoading(false);
            let errorMessage = 'Failed to load users';
            
            if (error.response && error.response.error) {
                errorMessage = error.response.error;
            }
            
            if (error.status === 403) {
                errorMessage = 'Access denied. Admin privileges required.';
                // Redirect to home after a delay
                setTimeout(() => {
                    window.location.href = '/home';
                }, 2000);
            }
            
            showError(errorMessage);
        });
}

function displayUsers(users) {
    const container = document.getElementById('usersContainer');
    const noResultsMsg = document.getElementById('noResultsMessage');
    
    if (!container) return;
    
    if (users.length === 0) {
        container.innerHTML = '';
        noResultsMsg.style.display = 'block';
        return;
    }
    
    noResultsMsg.style.display = 'none';
    
    const usersHTML = users.map(user => createUserCard(user)).join('');
    container.innerHTML = usersHTML;
    
    // Attach delete button event listeners
    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const user = currentUsers.find(u => u.id === userId);
            if (user) {
                showDeleteModal(user);
            }
        });
    });
    
    // Attach toggle admin button event listeners
    container.querySelectorAll('.toggle-admin-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const user = currentUsers.find(u => u.id === userId);
            if (user) {
                toggleUserRole(userId, user);
            }
        });
    });
}

function createUserCard(user) {
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
    const isAdmin = user.isAdmin;
    const roleClass = isAdmin ? 'admin-badge' : 'user-badge';
    const roleText = isAdmin ? 'Admin' : 'User';
    
    // Admin users cannot be modified (no delete or role change buttons)
    const actionButtons = isAdmin ? '' : `
        <button class="btn btn-info toggle-admin-btn" data-user-id="${user.id}">
            Make Admin
        </button>
        <button class="btn btn-danger delete-btn" data-user-id="${user.id}">
            Delete
        </button>
    `;
    
    return `
        <div class="user-card">
            <div class="user-info">
                <div class="user-avatar">${initials}</div>
                <div class="user-details">
                    <h5>${escapeHtml(user.name || 'Unknown')}</h5>
                    <p>${escapeHtml(user.email || 'No email')}</p>
                    <p><small>Created: ${formatDate(user.createdAt)}</small></p>
                </div>
            </div>
            <div class="user-meta">
                <span class="${roleClass}">${roleText}</span>
                <div class="user-actions">
                    ${actionButtons}
                </div>
            </div>
        </div>
    `;
}

function showDeleteModal(user) {
    const nameElement = document.getElementById('deleteUserName');
    const emailElement = document.getElementById('deleteUserEmail');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    if (nameElement) nameElement.textContent = user.name || 'Unknown';
    if (emailElement) emailElement.textContent = user.email || 'No email';
    if (confirmBtn) confirmBtn.setAttribute('data-user-id', user.id);
    
    if (deleteModal) {
        deleteModal.show();
    }
}

function handleConfirmDelete() {
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const userId = confirmBtn ? confirmBtn.getAttribute('data-user-id') : null;
    
    if (!userId) return;
    
    // Disable button to prevent double clicks
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Deleting...';
    }
    
    makeRequest('DELETE', `/user/manage/${userId}`)
        .then(function(response) {
            if (deleteModal) {
                deleteModal.hide();
            }
            
            showSuccess(response.message || 'User deleted successfully');
            
            // Refresh the user list
            const searchInput = document.getElementById('userSearch');
            const query = searchInput ? searchInput.value.trim() : '';
            searchUsers(query);
        })
        .catch(function(error) {
            let errorMessage = 'Failed to delete user';
            
            if (error.response && error.response.error) {
                errorMessage = error.response.error;
            }
            
            showError(errorMessage);
        })
        .finally(function() {
            // Re-enable button
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Delete User';
            }
        });
}

function toggleUserRole(userId, user) {
    if (confirm(`Are you sure you want to make ${user.name} an admin?`)) {
        makeRequest('PUT', `/user/toggle-role/${userId}`)
            .then(function(response) {
                showSuccess(response.message || 'User role updated successfully');
                
                // Refresh the user list
                const searchInput = document.getElementById('userSearch');
                const query = searchInput ? searchInput.value.trim() : '';
                searchUsers(query);
            })
            .catch(function(error) {
                let errorMessage = 'Failed to update user role';
                
                if (error.response && error.response.error) {
                    errorMessage = error.response.error;
                }
                
                showError(errorMessage);
            });
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        makeRequest('POST', '/user/logout')
            .then(function() {
                window.location.href = '/login';
            })
            .catch(function() {
                showError('Logout failed. Please try again.');
            });
    }
}

// Utility functions
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    hideMessages();
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    hideMessages();
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }
}

function hideMessages() {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
}

function updateUserCount(count) {
    const userCountDiv = document.getElementById('userCount');
    const countNumberSpan = document.getElementById('countNumber');
    
    if (userCountDiv && countNumberSpan) {
        countNumberSpan.textContent = count;
        userCountDiv.style.display = count > 0 ? 'block' : 'none';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return 'Invalid date';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
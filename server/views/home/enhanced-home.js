// Enhanced Home Page JavaScript for Community Posts Feed

let currentFeedPosts = [];
let currentUser = null;
let isMyPostsOnly = false;

// DOM Elements
const postsContainer = document.getElementById('postsContainer');
const myPostsOnlyFilter = document.getElementById('myPostsOnlyFilter');
const emptyFeedState = document.getElementById('emptyFeedState');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();
    loadCurrentUser();
    loadHomeFeed();
    setupEventListeners();
});

// Check if user is admin and show/hide admin features
function checkAdminAccess() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/user/current', true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.user && response.user.isAdmin) {
                        const manageUsersBtn = document.getElementById('manage-users-btn');
                        if (manageUsersBtn) {
                            manageUsersBtn.style.display = 'block';
                        }
                    }
                } catch (e) {
                    console.error('Error parsing admin check response:', e);
                }
            }
        }
    };
    
    xhr.send();
}

// Load current user info
function loadCurrentUser() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/user/current', true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    currentUser = response.user;
                    updateUserDetails(currentUser);
                } catch (e) {
                    console.error('Error loading current user:', e);
                }
            }
        }
    };
    
    xhr.send();
}

// Update user details in the top right section
function updateUserDetails(user) {
    if (!user) return;
    
    const userFullNameElement = document.getElementById('userFullName');
    const userProfilePictureElement = document.getElementById('userProfilePicture');
    
    if (userFullNameElement) {
        userFullNameElement.textContent = user.name || 'Unknown User';
    }
    
    if (userProfilePictureElement) {
        // Use user's profile picture if available, otherwise use default
        userProfilePictureElement.src = user.profilePicture || 'assets/recources/user.jpg';
        userProfilePictureElement.alt = `${user.name || 'User'}'s Profile Picture`;
    }
}

// Setup event listeners
function setupEventListeners() {
    // My posts only filter
    if (myPostsOnlyFilter) {
        myPostsOnlyFilter.addEventListener('change', handleFilterChange);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Theme toggle (if exists)
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Scroll to top button
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', scrollToTop);
        window.addEventListener('scroll', toggleScrollButton);
    }
}

// Load home feed
function loadHomeFeed() {
    showLoading();
    
    const url = isMyPostsOnly ? '/feed?my-posts-only=true' : '/feed';
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                currentFeedPosts = JSON.parse(xhr.responseText);
                displayFeedPosts();
            } else {
                showError('Failed to load feed. Please refresh the page.');
            }
        }
    };
    xhr.send();
}

// Handle filter change
function handleFilterChange() {
    isMyPostsOnly = myPostsOnlyFilter.checked;
    loadHomeFeed();
}

// Display feed posts
function displayFeedPosts() {
    hideLoading();
    
    if (currentFeedPosts.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    postsContainer.innerHTML = '';
    
    currentFeedPosts.forEach(post => {
        const postElement = createPostElement(post);
        postsContainer.appendChild(postElement);
    });
}

// Create post element
function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'single-post';
    div.setAttribute('data-post-id', post.id);
    
    const timeAgo = getTimeAgo(new Date(post.createdAt));
    const isOwnPost = currentUser && currentUser.id === post.authorId;
    
    // Use author's profile picture if available, otherwise use default
    const authorProfilePicture = post.authorProfilePicture || 'assets/recources/user.jpg';
    
    div.innerHTML = `
        <div class="post-header">
            <img src="${authorProfilePicture}" alt="${escapeHtml(post.authorName)}" class="profile-pic">
            <div class="post-user-info">
                <p class="post-username">${escapeHtml(post.authorName)}
                    <span class="post_time">• ${timeAgo}</span>
                </p>
                <p class="community-name">in ${escapeHtml(post.communityName)}</p>
            </div>
            ${isOwnPost ? `<button class="delete-post btn btn-sm btn-link text-muted p-0" title="Delete Post" onclick="deletePost('${post.id}')">🗑</button>` : ''}
        </div>
        
        <div class="post-content">
            ${post.title ? `<div class="post-title">${escapeHtml(post.title)}</div>` : ''}
            <img src="${post.imageData}" alt="Post Image" class="post-image" loading="lazy">
        </div>
        
        <div class="post-actions">
            <button class="action-btn like-btn" onclick="likePost('${post.id}')">
                <img src="assets/recources/notifications.png" alt="Like">
            </button>
            <button class="action-btn comment-btn" onclick="toggleComments('${post.id}')">
                <img src="assets/recources/comment.png" alt="Comment">
            </button>
            <button class="action-btn share-btn" onclick="sharePost('${post.id}')">
                <img src="assets/recources/messages-removebg.png" alt="Share">
            </button>
        </div>
        
        <div class="post-meta px-2">
            <p class="post-date text-muted mb-1" style="font-size: 12px;">
                ${new Date(post.createdAt).toLocaleDateString()} at ${new Date(post.createdAt).toLocaleTimeString()}
            </p>
        </div>
    `;
    
    return div;
}

// Delete post
function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `/posts/${postId}`, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                showAlert('Post deleted successfully!', 'success');
                // Remove post from DOM
                const postElement = document.querySelector(`[data-post-id="${postId}"]`);
                if (postElement) {
                    postElement.remove();
                }
                // Remove from current posts array
                currentFeedPosts = currentFeedPosts.filter(p => p.id !== postId);
                // Show empty state if no posts left
                if (currentFeedPosts.length === 0) {
                    showEmptyState();
                }
            } else {
                const error = JSON.parse(xhr.responseText);
                showAlert(error.error || 'Failed to delete post', 'danger');
            }
        }
    };
    xhr.send();
}

// Placeholder functions for future features
function likePost(postId) {
    showAlert('Like functionality coming soon!', 'info');
}

function toggleComments(postId) {
    showAlert('Comments functionality coming soon!', 'info');
}

function sharePost(postId) {
    // Use existing share modal if available
    const shareModal = document.getElementById('shareModal');
    if (shareModal) {
        shareModal.style.display = 'block';
    } else {
        showAlert('Share functionality coming soon!', 'info');
    }
}

// Handle logout
function handleLogout() {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/user/logout', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                window.location.href = '/login';
            } else {
                showAlert('Logout failed. Please try again.', 'danger');
            }
        }
    };
    xhr.send();
}

// Theme toggle (from original)
function toggleTheme() {
    const body = document.body;
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        themeToggleBtn.textContent = 'Dark mode';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        themeToggleBtn.textContent = 'Light mode';
        localStorage.setItem('theme', 'dark');
    }
}

// Initialize theme on load
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggleBtn) themeToggleBtn.textContent = 'Light mode';
    } else {
        if (themeToggleBtn) themeToggleBtn.textContent = 'Dark mode';
    }
}

// Scroll functionality
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleScrollButton() {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    }
}

// Utility functions
function showLoading() {
    postsContainer.innerHTML = `
        <div class="loading-posts text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading your feed...</p>
        </div>
    `;
}

function hideLoading() {
    const loadingElement = postsContainer.querySelector('.loading-posts');
    if (loadingElement) {
        loadingElement.remove();
    }
}

function showEmptyState() {
    postsContainer.style.display = 'none';
    emptyFeedState.style.display = 'block';
}

function hideEmptyState() {
    postsContainer.style.display = 'block';
    emptyFeedState.style.display = 'none';
}

function showError(message) {
    hideLoading();
    postsContainer.innerHTML = `
        <div class="error-state text-center py-5">
            <h4 class="text-danger mb-3">Error</h4>
            <p class="text-muted">${message}</p>
            <button class="btn btn-primary" onclick="loadHomeFeed()">Try Again</button>
        </div>
    `;
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
    
    const feedContainer = document.querySelector('.feed-container');
    feedContainer.insertBefore(alert, feedContainer.firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
});

// Handle share modal (from original)
document.addEventListener('DOMContentLoaded', function() {
    const shareModal = document.getElementById('shareModal');
    const closeBtn = shareModal ? shareModal.querySelector('.close-btn') : null;
    
    if (closeBtn && shareModal) {
        closeBtn.addEventListener('click', function() {
            shareModal.style.display = 'none';
        });
        
        window.addEventListener('click', function(event) {
            if (event.target === shareModal) {
                shareModal.style.display = 'none';
            }
        });
    }
});
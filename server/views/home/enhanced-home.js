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
                    // Load feed after user data is loaded to ensure like status is correct
                    loadHomeFeed();
                } catch (e) {
                    console.error('Error loading current user:', e);
                    // Still load feed even if user loading fails
                    loadHomeFeed();
                }
            } else {
                console.error('Failed to load current user');
                // Still load feed even if user loading fails
                loadHomeFeed();
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
            <button class="action-btn like-btn" onclick="likePost('${post.id}')" data-post-id="${post.id}">
                <img src="${post.likes && post.likes.includes(currentUser?.id) ? 'assets/recources/filled-heart.png' : 'assets/recources/notifications.png'}" alt="Like" class="like-icon">
                <span class="likes-count">${post.likesCount || 0}</span>
            </button>
            <button class="action-btn comment-btn" onclick="toggleComments('${post.id}')">
                <img src="assets/recources/comment.png" alt="Comment">
            </button>
            <button class="action-btn share-btn" onclick="sharePost('${post.id}')" title="Share on Facebook">
                <img src="assets/recources/facebook.png" alt="Share on Facebook">
            </button>
        </div>
        
        <div class="comments-section" id="comments-${post.id}" style="display: none;">
            <div class="add-comment">
                <input type="text" class="comment-input" placeholder="Add a comment..." maxlength="500" onkeypress="handleCommentKeyPress(event, '${post.id}')">
                <button class="comment-submit-btn" onclick="addComment('${post.id}')">Post</button>
            </div>
            <div class="comments-list" id="comments-list-${post.id}">
                <!-- Comments will be loaded here -->
            </div>
        </div>
        
        ${getLatestCommentHtml(post)}
        
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

// Like/Unlike post functionality
function likePost(postId) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/posts/${postId}/like`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                updateLikeButton(postId, response.isLiked, response.likesCount);
            } else {
                const error = JSON.parse(xhr.responseText);
                showAlert(error.error || 'Failed to update like', 'danger');
            }
        }
    };
    
    xhr.send();
}

// Update like button appearance and count
function updateLikeButton(postId, isLiked, likesCount) {
    const likeBtn = document.querySelector(`[data-post-id="${postId}"]`);
    if (likeBtn) {
        const likeIcon = likeBtn.querySelector('.like-icon');
        const likesCountSpan = likeBtn.querySelector('.likes-count');
        
        if (likeIcon) {
            likeIcon.src = isLiked ? 'assets/recources/filled-heart.png' : 'assets/recources/notifications.png';
        }
        
        if (likesCountSpan) {
            likesCountSpan.textContent = likesCount;
        }
    }
    
    // Update the post data in memory to maintain state
    const post = currentFeedPosts.find(p => p.id === postId);
    if (post && currentUser) {
        if (!post.likes) {
            post.likes = [];
        }
        
        if (isLiked) {
            // Add user to likes if not already there
            if (!post.likes.includes(currentUser.id)) {
                post.likes.push(currentUser.id);
            }
        } else {
            // Remove user from likes
            post.likes = post.likes.filter(userId => userId !== currentUser.id);
        }
        
        post.likesCount = likesCount;
    }
}

// Toggle comments section visibility
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        if (commentsSection.style.display === 'none' || commentsSection.style.display === '') {
            commentsSection.style.display = 'block';
            loadComments(postId);
        } else {
            commentsSection.style.display = 'none';
        }
    }
}

// Load comments for a post
function loadComments(postId) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/posts/${postId}/comments`, true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                displayComments(postId, response.comments);
            } else {
                const error = JSON.parse(xhr.responseText);
                showAlert(error.error || 'Failed to load comments', 'danger');
            }
        }
    };
    
    xhr.send();
}

// Display comments in the comments list
function displayComments(postId, comments) {
    const commentsList = document.getElementById(`comments-list-${postId}`);
    if (!commentsList) return;
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments text-muted">No comments yet.</p>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => {
        const timeAgo = getTimeAgo(new Date(comment.createdAt));
        const profilePicture = comment.authorProfilePicture || 'assets/recources/user.jpg';
        const isOwnComment = currentUser && currentUser.id === comment.authorId;
        const updatedText = comment.updatedAt && comment.updatedAt !== comment.createdAt ? ' (edited)' : '';
        
        return `
            <div class="comment" data-comment-id="${comment.id}">
                <img src="${profilePicture}" alt="${escapeHtml(comment.authorName)}" class="comment-profile-pic">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${escapeHtml(comment.authorName)}</span>
                        <span class="comment-time">${timeAgo}${updatedText}</span>
                        ${isOwnComment ? `
                            <div class="comment-actions">
                                <button class="comment-action-btn edit-comment-btn" onclick="editComment('${postId}', '${comment.id}', '${escapeHtml(comment.text).replace(/'/g, '\\\'')}')" title="Edit comment">
                                    ✏️
                                </button>
                                <button class="comment-action-btn delete-comment-btn" onclick="deleteComment('${postId}', '${comment.id}')" title="Delete comment">
                                    🗑️
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="comment-text-container">
                        <p class="comment-text" id="comment-text-${comment.id}">${escapeHtml(comment.text)}</p>
                        <div class="edit-comment-form" id="edit-form-${comment.id}" style="display: none;">
                            <input type="text" class="edit-comment-input" id="edit-input-${comment.id}" value="${escapeHtml(comment.text)}" maxlength="500">
                            <div class="edit-comment-buttons">
                                <button class="btn btn-sm btn-primary" onclick="saveCommentEdit('${postId}', '${comment.id}')">Save</button>
                                <button class="btn btn-sm btn-secondary" onclick="cancelCommentEdit('${comment.id}')">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Add new comment
function addComment(postId) {
    const commentInput = document.querySelector(`#comments-${postId} .comment-input`);
    if (!commentInput) return;
    
    const text = commentInput.value.trim();
    if (!text) {
        showAlert('Please enter a comment', 'warning');
        return;
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/posts/${postId}/comments`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                const response = JSON.parse(xhr.responseText);
                commentInput.value = ''; // Clear input
                loadComments(postId); // Reload comments to show the new one
                updateLatestComment(postId, response.comment);
            } else {
                const error = JSON.parse(xhr.responseText);
                showAlert(error.error || 'Failed to add comment', 'danger');
            }
        }
    };
    
    xhr.send(JSON.stringify({ text }));
}

// Handle Enter key press in comment input
function handleCommentKeyPress(event, postId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addComment(postId);
    }
}

// Update latest comment display
function updateLatestComment(postId, comment) {
    const latestCommentSection = document.querySelector(`[data-post-id="${postId}"]`).closest('.single-post').querySelector('.latest-comment');
    if (latestCommentSection && comment) {
        const timeAgo = getTimeAgo(new Date(comment.createdAt));
        latestCommentSection.innerHTML = `
            <div class="latest-comment-content">
                <span class="latest-comment-author">${escapeHtml(comment.authorName)}</span>
                <span class="latest-comment-text">${escapeHtml(comment.text)}</span>
                <span class="latest-comment-time">${timeAgo}</span>
            </div>
        `;
        latestCommentSection.style.display = 'block';
    }
}

// Get latest comment HTML for post
function getLatestCommentHtml(post) {
    if (!post.comments || post.comments.length === 0) {
        return '<div class="latest-comment" style="display: none;"></div>';
    }
    
    // Get the most recent comment
    const latestComment = post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const timeAgo = getTimeAgo(new Date(latestComment.createdAt));
    
    return `
        <div class="latest-comment px-2">
            <div class="latest-comment-content">
                <span class="latest-comment-author">${escapeHtml(latestComment.authorName)}</span>
                <span class="latest-comment-text">${escapeHtml(latestComment.text)}</span>
                <span class="latest-comment-time">${timeAgo}</span>
            </div>
            ${post.comments.length > 1 ? `<button class="view-all-comments" onclick="toggleComments('${post.id}')">View all ${post.comments.length} comments</button>` : ''}
        </div>
    `;
}

function sharePost(postId) {
    // Find the post data
    const post = currentFeedPosts.find(p => p.id === postId);
    if (!post) {
        showAlert('Post not found', 'error');
        return;
    }
    
    // Create Facebook share URL
    const postTitle = post.title || `Check out this post by ${post.authorName}`;
    const postDescription = `Posted in ${post.communityName} community`;
    const postImage = post.imageData;
    const currentPageUrl = window.location.href;
    
    // Facebook share URL with parameters
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentPageUrl)}&quote=${encodeURIComponent(postTitle + ' - ' + postDescription)}`;
    
    // Open Facebook share in a new window
    const shareWindow = window.open(
        facebookShareUrl,
        'facebook-share-dialog',
        'width=626,height=436,resizable=yes,scrollbars=yes'
    );
    
    // Show success message
    if (shareWindow) {
        showAlert('Opening Facebook share dialog...', 'success');
    } else {
        showAlert('Please allow popups to share on Facebook', 'warning');
    }
}

// Edit comment functionality
function editComment(postId, commentId, currentText) {
    // Hide the comment text and show the edit form
    const commentText = document.getElementById(`comment-text-${commentId}`);
    const editForm = document.getElementById(`edit-form-${commentId}`);
    const editInput = document.getElementById(`edit-input-${commentId}`);
    
    if (commentText && editForm && editInput) {
        commentText.style.display = 'none';
        editForm.style.display = 'block';
        editInput.focus();
        editInput.select();
    }
}

// Cancel comment edit
function cancelCommentEdit(commentId) {
    const commentText = document.getElementById(`comment-text-${commentId}`);
    const editForm = document.getElementById(`edit-form-${commentId}`);
    
    if (commentText && editForm) {
        commentText.style.display = 'block';
        editForm.style.display = 'none';
    }
}

// Save comment edit
function saveCommentEdit(postId, commentId) {
    const editInput = document.getElementById(`edit-input-${commentId}`);
    if (!editInput) return;
    
    const newText = editInput.value.trim();
    if (!newText) {
        showAlert('Comment cannot be empty', 'warning');
        return;
    }
    
    if (newText.length > 500) {
        showAlert('Comment must not exceed 500 characters', 'warning');
        return;
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `/posts/${postId}/comments/${commentId}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                showAlert('Comment updated successfully', 'success');
                loadComments(postId); // Reload comments to show the updated comment
            } else {
                const error = JSON.parse(xhr.responseText);
                showAlert(error.error || 'Failed to update comment', 'danger');
            }
        }
    };
    
    xhr.send(JSON.stringify({ text: newText }));
}

// Delete comment functionality
function deleteComment(postId, commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `/posts/${postId}/comments/${commentId}`, true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                showAlert('Comment deleted successfully', 'success');
                loadComments(postId); // Reload comments to remove the deleted comment
                
                // Update the post in memory to remove the comment
                const post = currentFeedPosts.find(p => p.id === postId);
                if (post && post.comments) {
                    post.comments = post.comments.filter(c => c.id !== commentId);
                    
                    // Update the latest comment display if needed
                    updateLatestCommentAfterDelete(postId, post);
                }
            } else {
                const error = JSON.parse(xhr.responseText);
                showAlert(error.error || 'Failed to delete comment', 'danger');
            }
        }
    };
    
    xhr.send();
}

// Update latest comment display after deletion
function updateLatestCommentAfterDelete(postId, post) {
    const latestCommentSection = document.querySelector(`[data-post-id="${postId}"] .latest-comment`);
    if (latestCommentSection) {
        if (post.comments.length === 0) {
            latestCommentSection.style.display = 'none';
        } else {
            // Get the new latest comment
            const latestComment = post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            const timeAgo = getTimeAgo(new Date(latestComment.createdAt));
            
            latestCommentSection.innerHTML = `
                <div class="latest-comment-content">
                    <span class="latest-comment-author">${escapeHtml(latestComment.authorName)}</span>
                    <span class="latest-comment-text">${escapeHtml(latestComment.text)}</span>
                    <span class="latest-comment-time">${timeAgo}</span>
                </div>
                ${post.comments.length > 1 ? `<button class="view-all-comments" onclick="toggleComments('${postId}')">View all ${post.comments.length} comments</button>` : ''}
            `;
        }
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


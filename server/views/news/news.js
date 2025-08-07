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

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Function to create news card HTML
function createNewsCard(article) {
    const imageUrl = article.thumbnail || 'https://via.placeholder.com/400x200?text=No+Image';
    const formattedDate = formatDate(article.pubDate);
    
    return `
        <div class="news-card">
            <img src="${imageUrl}" alt="${article.title}" class="news-image" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
            <div class="news-content">
                <h3 class="news-title">${article.title}</h3>
                <p class="news-description">${article.description}</p>
                <div class="news-meta">
                    <span class="news-date">${formattedDate}</span>
                    <a href="${article.link}" target="_blank" class="read-more">Read More →</a>
                </div>
            </div>
        </div>
    `;
}

// Function to fetch news data using AJAX
function fetchNews() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/news/api', true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                displayNews(data);
            } catch (error) {
                showError('Error parsing news data');
            }
        } else {
            showError('Failed to fetch news data');
        }
    };
    
    xhr.onerror = function() {
        showError('Network error occurred');
    };
    
    xhr.send();
}

// Function to display news
function displayNews(data) {
    const container = document.getElementById('news-container');
    
    if (data.status === 'ok' && data.items && data.items.length > 0) {
        const newsHTML = data.items.map(article => createNewsCard(article)).join('');
        container.innerHTML = `
            <div class="news-grid">
                ${newsHTML}
            </div>
        `;
    } else {
        showError('No news articles available');
    }
}

// Function to show error
function showError(message) {
    const container = document.getElementById('news-container');
    container.innerHTML = `
        <div class="error">
            <p>${message}</p>
            <button onclick="fetchNews()">Try Again</button>
        </div>
    `;
}

// Handle logout functionality
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        makeRequest('POST', '/user/logout')
            .then(function() {
                window.location.href = '/login';
            })
            .catch(function() {
                alert('Logout failed. Please try again.');
            });
    }
}

// Check admin access and show/hide manage users button
function checkAdminAccess() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/user/current', true);
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.user && response.user.isAdmin) {
                        const manageUsersBtn = document.querySelector('.sidebar_btn[onclick*="user-management"]');
                        if (manageUsersBtn) {
                            manageUsersBtn.style.display = 'block';
                        }
                    } else {
                        const manageUsersBtn = document.querySelector('.sidebar_btn[onclick*="user-management"]');
                        if (manageUsersBtn) {
                            manageUsersBtn.style.display = 'none';
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

// Load news when page loads
document.addEventListener('DOMContentLoaded', function() {
    fetchNews();
    checkAdminAccess();
    
    // Attach logout button event listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}); 
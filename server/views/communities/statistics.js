// Statistics Page JavaScript with D3.js

let postActivityData = [];

// Color scheme for different communities
const colorScale = d3.scaleOrdinal()
    .range(['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ffecd2', '#fcb69f']);

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    setupLogout();
    checkAdminAccess();
    loadStatistics();
});

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/user/logout', true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    window.location.href = '/user/login';
                }
            };
            xhr.send();
        });
    }
}

// Load all statistics data
async function loadStatistics() {
    try {
        showLoading();
        
        // Load post activity data
        const activityResponse = await fetchData('/communities/statistics/post-activity');
        postActivityData = activityResponse;

        if (postActivityData.length === 0) {
            showNoData();
            return;
        }

        hideLoading();
        renderCharts();
        renderSummaryStats();

    } catch (error) {
        console.error('Error loading statistics:', error);
        showError('Failed to load statistics data');
    }
}

// Fetch data helper function
function fetchData(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            }
        };
        xhr.send();
    });
}

// Render all charts
function renderCharts() {
    renderPostActivityChart();
}


// Render post activity bar chart
function renderPostActivityChart() {
    const container = d3.select('#postActivityChart');
    container.selectAll('*').remove(); // Clear previous chart

    if (!postActivityData || postActivityData.length === 0) {
        container.append('div')
            .attr('class', 'alert alert-info text-center')
            .html('<p>No post activity data available</p>');
        return;
    }

    const margin = { top: 20, right: 60, bottom: 100, left: 60 };
    const containerWidth = container.node().getBoundingClientRect().width;
    const width = containerWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', containerWidth)
        .attr('height', 400);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
        .domain(postActivityData.map(d => d.communityName))
        .range([0, width])
        .padding(0.2);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(postActivityData, d => Math.max(d.totalPosts, d.totalLikes, d.totalComments))])
        .nice()
        .range([height, 0]);

    // Add axes
    g.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

    g.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(yScale));

    // Add axis labels
    g.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Count');

    // Create tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('display', 'none');

    // Bar width for grouped bars
    const barWidth = xScale.bandwidth() / 3;

    // Draw bars for posts
    g.selectAll('.bar-posts')
        .data(postActivityData)
        .enter().append('rect')
        .attr('class', 'bar bar-posts')
        .attr('x', d => xScale(d.communityName))
        .attr('y', d => yScale(d.totalPosts))
        .attr('width', barWidth)
        .attr('height', d => height - yScale(d.totalPosts))
        .style('fill', '#667eea')
        .on('mouseover', function(event, d) {
            tooltip.style('display', 'block')
                .html(`<strong>${d.communityName}</strong><br/>Posts: ${d.totalPosts}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
            tooltip.style('display', 'none');
        });

    // Draw bars for likes
    g.selectAll('.bar-likes')
        .data(postActivityData)
        .enter().append('rect')
        .attr('class', 'bar bar-likes')
        .attr('x', d => xScale(d.communityName) + barWidth)
        .attr('y', d => yScale(d.totalLikes))
        .attr('width', barWidth)
        .attr('height', d => height - yScale(d.totalLikes))
        .style('fill', '#f093fb')
        .on('mouseover', function(event, d) {
            tooltip.style('display', 'block')
                .html(`<strong>${d.communityName}</strong><br/>Likes: ${d.totalLikes}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
            tooltip.style('display', 'none');
        });

    // Draw bars for comments
    g.selectAll('.bar-comments')
        .data(postActivityData)
        .enter().append('rect')
        .attr('class', 'bar bar-comments')
        .attr('x', d => xScale(d.communityName) + barWidth * 2)
        .attr('y', d => yScale(d.totalComments))
        .attr('width', barWidth)
        .attr('height', d => height - yScale(d.totalComments))
        .style('fill', '#4facfe')
        .on('mouseover', function(event, d) {
            tooltip.style('display', 'block')
                .html(`<strong>${d.communityName}</strong><br/>Comments: ${d.totalComments}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
            tooltip.style('display', 'none');
        });

    // Add legend
    const legend = g.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 200}, 20)`);

    const legendData = [
        { label: 'Posts', color: '#667eea' },
        { label: 'Likes', color: '#f093fb' },
        { label: 'Comments', color: '#4facfe' }
    ];

    legendData.forEach((item, i) => {
        const legendItem = legend.append('g')
            .attr('class', 'legend-item')
            .attr('transform', `translate(0, ${i * 20})`);

        legendItem.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .style('fill', item.color);

        legendItem.append('text')
            .attr('x', 20)
            .attr('y', 7)
            .attr('dy', '0.35em')
            .text(item.label);
    });
}

// Render summary statistics
function renderSummaryStats() {
    const summaryContainer = d3.select('#summaryStats');
    summaryContainer.selectAll('*').remove();

    if (!postActivityData || postActivityData.length === 0) {
        return;
    }

    // Calculate totals
    const totalCommunities = postActivityData.length;
    const totalPosts = postActivityData.reduce((sum, d) => sum + d.totalPosts, 0);
    const totalLikes = postActivityData.reduce((sum, d) => sum + d.totalLikes, 0);
    const totalComments = postActivityData.reduce((sum, d) => sum + d.totalComments, 0);

    const summaryData = [
        { title: 'Communities Managed', value: totalCommunities, description: 'Total communities you manage' },
        { title: 'Total Posts', value: totalPosts, description: 'Posts across all communities' },
        { title: 'Total Likes', value: totalLikes, description: 'Likes received on all posts' },
        { title: 'Total Comments', value: totalComments, description: 'Comments on all posts' }
    ];

    summaryData.forEach(stat => {
        const col = summaryContainer.append('div')
            .attr('class', 'col-md-3 col-sm-6');

        const card = col.append('div')
            .attr('class', 'summary-card');

        card.append('h4').text(stat.value);
        card.append('p').text(stat.title);
        card.append('small').text(stat.description);
    });
}

// Loading and error states
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'block';
    document.getElementById('statisticsContent').style.display = 'none';
    document.getElementById('noDataMessage').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('statisticsContent').style.display = 'block';
}

function showNoData() {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('statisticsContent').style.display = 'none';
    document.getElementById('noDataMessage').style.display = 'block';
}

function showError(message) {
    document.getElementById('loadingSpinner').style.display = 'none';
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger text-center';
    errorDiv.innerHTML = `<h4>Error</h4><p>${message}</p>`;
    container.appendChild(errorDiv);
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
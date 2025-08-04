// Add new post to feed from user input
function addNewPostToFeed(caption, imageUrl) {
  const postsContainer = document.querySelector('.posts');
  if (!postsContainer) return;
  const newPost = document.createElement('div');
  newPost.className = 'single-post';
  newPost.innerHTML = `
    <div class="post-header">
      <img src="IMG/user.jpg" alt="user" class="profile-pic">
      <p class="post-username">Monica <span class="post_time">&#x2022; עכשיו</span></p>
      <button class="delete-post btn btn-sm btn-link text-muted p-0" title="Delete Post">🗑</button>
    </div>
    <img src="${imageUrl ? imageUrl : 'IMG/puppy-post.jpg'}" alt="Post Image" class="post-image">
    <div class="post-actions">
      <img src="IMG/notifications.png" alt="Like" class="like-btn" data-post-id="new">
      <img src="IMG/comment.png" alt="Comment">
      <img src="IMG/messages-removebg.png" alt="Share">
    </div>
    <p id="likes-count-new" class="px-2 mb-1" style="font-size: 15px;"><strong>1 like</strong></p>
    <p class="px-2 mb-1" style="font-size: 14px;"><strong>Monica</strong> ${escapeHTML(caption)}</p>
    <div class="px-2 mb-2 add-comment-section">
      <div class="comments-list" style="display:none;"></div>
      <button type="button" class="btn btn-link text-muted text-decoration-none p-0 add-comment-btn" style="font-size: 14px;">Add a comment…</button>
      <form class="add-comment-form" style="display:none; margin-top:5px;">
        <input type="text" class="form-control form-control-sm comment-input" placeholder="Add a comment..." maxlength="200" required>
        <button type="submit" class="btn btn-primary btn-sm mt-1">Post</button>
      </form>
    </div>
  `;
  postsContainer.prepend(newPost);
  highlightNewPost(newPost);
  attachPostEventListeners(newPost);
  showNewPostAlert();
}

// Show 'New post added!' alert (create if not exists)
function showNewPostAlert() {
  let alertDiv = document.getElementById('newPostAlert');
  if (!alertDiv) {
    // create the alert div and insert at the top of the feed container
    const feedContainer = document.querySelector('.feed-container');
    if (!feedContainer) return;
    alertDiv = document.createElement('div');
    alertDiv.id = 'newPostAlert';
    alertDiv.className = 'alert alert-success text-center';
    alertDiv.style.display = 'none';
    alertDiv.style.position = 'sticky';
    alertDiv.style.top = '0';
    alertDiv.style.zIndex = '1000';
    alertDiv.textContent = 'New post added!';
    feedContainer.insertBefore(alertDiv, feedContainer.firstChild);
  }
  alertDiv.style.display = 'block';
  setTimeout(() => {
    alertDiv.style.display = 'none';
  }, 2500);
}

// Attach like, delete, and comment listeners to a post element
function attachPostEventListeners(postElement) {
  // Like button
  const likeBtn = postElement.querySelector('.like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', () => toggleLike(likeBtn));
  }
  // Delete button
  const deleteBtn = postElement.querySelector('.delete-post');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function () {
      const confirmed = confirm("Are you sure you want to delete this post?");
      if (confirmed) {
        const post = deleteBtn.closest('.single-post');
        if (post) post.remove();
      }
    });
  }
  // Add comment button
  const addCommentBtn = postElement.querySelector('.add-comment-btn');
  const addCommentForm = postElement.querySelector('.add-comment-form');
  if (addCommentBtn && addCommentForm) {
    addCommentBtn.addEventListener('click', function() {
      addCommentForm.style.display = addCommentForm.style.display === 'none' ? 'block' : 'none';
      if (addCommentForm.style.display === 'block') {
        addCommentForm.querySelector('.comment-input').focus();
      }
    });
    addCommentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const input = addCommentForm.querySelector('.comment-input');
      const commentText = escapeHTML(input.value.trim());
      if (commentText) {
        const commentsList = postElement.querySelector('.comments-list');
        const commentDiv = document.createElement('div');
        commentDiv.className = 'single-comment';
        commentDiv.innerHTML = '<strong>Monica</strong> ' + commentText;
        commentsList.appendChild(commentDiv);
        input.value = '';
        addCommentForm.style.display = 'none';
      }
    });
  }
}

// Add event listener to Create button and modal logic
document.addEventListener('DOMContentLoaded', function() {
  const createBtn = document.getElementById('create-post-btn');
  const createPostModal = document.getElementById('createPostModal');
  const createPostCloseBtn = document.getElementById('createPostCloseBtn');
  const createPostForm = document.getElementById('createPostForm');
  if (createBtn && createPostModal && createPostCloseBtn && createPostForm) {
    createBtn.addEventListener('click', function() {
      createPostModal.style.display = 'block';
      setTimeout(() => document.getElementById('postCaption').focus(), 100);
    });
    createPostCloseBtn.addEventListener('click', function() {
      createPostModal.style.display = 'none';
      createPostForm.reset();
    });
    createPostModal.addEventListener('click', function(e) {
      if (e.target === createPostModal) {
        createPostModal.style.display = 'none';
        createPostForm.reset();
      }
    });
    createPostForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const caption = document.getElementById('postCaption').value.trim();
      const imageUrl = document.getElementById('postImage').value.trim();
      if (caption) {
        addNewPostToFeed(caption, imageUrl);
        createPostModal.style.display = 'none';
        createPostForm.reset();
      }
    });
  }
});

// Highlight a new post with animation
function highlightNewPost(postElement) {
  postElement.classList.add('new-post-highlight');
  setTimeout(() => {
    postElement.classList.remove('new-post-highlight');
  }, 2000); // Duration matches CSS animation
}

// example for publishing new post
// const postsContainer = document.querySelector('.posts');
// const newPost = document.createElement('div');
// newPost.className = 'single-post';
// newPost.innerHTML = '...'; // here goes the content of the post
// postsContainer.prepend(newPost);
// highlightNewPost(newPost);

// Query Selectors
const likeButtons = document.querySelectorAll('.like-btn'); // select the like buttons
const likedPosts = {}; //An object that contains which postshave already been liked 

// FUNCTIONS

function toggleLike(button) {
    const postId = button.getAttribute('data-post-id'); // identifies the post by its unique id
    const likesCountElem = document.getElementById(`likes-count-${postId}`); // retrieves the like count element
    const likesText = likesCountElem.textContent;
    const match = likesText.match(/\d[\d,]*/); //pills the number of likes
    let currentLikes = match ? parseInt(match[0].replace(/,/g, '')) : 0;

    // like/unlike action 
    if (!likedPosts[postId]) 
    {
        currentLikes++;
        likedPosts[postId] = true;//mark post as liked
        button.src = 'IMG/filled-heart.png'; //change to likes heart icon
    } 
    else // If post was already liked, unlike it 
    {
        currentLikes--;
        likedPosts[postId] = false;
        button.src = 'IMG/notifications.png'; // change to original heart
    }

    //insure icon size dosent change
    button.classList.add('like-icon');

    // update the number of current likes
    likesCountElem.innerHTML = `<strong>${currentLikes.toLocaleString()} likes</strong>`;

    //scale up the image 
    button.style.transform = 'scale(1.4)';
    setTimeout(() => 
    {
        button.style.transform = 'scale(1)';
    }, 200);
}

// Scroll to Top Button
const scrollToTopBtn = document.getElementById("scrollToTopBtn");
// When the user clicks the scroll-to-top button
 // Smoothly scroll the window back to the top (top: 0)
window.onscroll = function () {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
};

scrollToTopBtn.addEventListener("click", function () {
    window.scrollTo({
        top: 0,// Scroll to the very top
        behavior: "smooth"// Use smooth scrolling animation
    });
});



// Toggle Dark/Light Mode

// Select the theme toggle button by its ID
const themeToggleBtn = document.getElementById("themeToggleBtn");

// Add a click event listener to the toggle button
themeToggleBtn.addEventListener("click", () => 
{
    // When clicked, toggle the 'dark-mode' class on the <body>
    // If 'dark-mode' exists, it will be removed; if not, it will be added
    document.body.classList.toggle("dark-mode");
});


// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () 
{
  // Select all delete buttons
  const deleteButtons = document.querySelectorAll(".delete-post");

  deleteButtons.forEach(button => 
    {
    button.addEventListener("click", function () 
    {
      // Ask the user to confirm the deletion
      const confirmed = confirm("Are you sure you want to delete this post?");
      
      //When the delete button is clicked, the browser shows a native confirm() dialog:
      //If the user clicks "OK", the post is deleted.
      //If the user clicks "Cancel" nothing happens.
      if (confirmed) 
        {
            // If confirmed, find the closest .single-post and remove it
            const postElement = button.closest(".single-post");
            if (postElement) 
            {
                postElement.remove();
            }
        }
    });
  });
});


// follow/following text on suggestion buttons
document.addEventListener("DOMContentLoaded", function () 
{
  const followButtons = document.querySelectorAll(".follow-btn");

  followButtons.forEach(button => {
     // Add a click event listener to each follow button
    button.addEventListener("click", function () {
      if (button.textContent.trim() === "Follow") 
        {
            button.textContent = "Following";
            button.classList.add("btn-following");
        }
      else 
        {
            button.textContent = "Follow";
            button.classList.remove("btn-following");
        }
    });
  });
});


// SHARE BUTTON FUNCTIONALITY
// Get the modal element
const shareModal = document.getElementById("shareModal");

// Get the close button inside the modal
const closeBtn = document.querySelector(".close-btn");

// Get all the share icons on posts (last icon in .post-actions)
const shareButtons = document.querySelectorAll(".post-actions img[alt='Share']");

// When any Share button is clicked, show the modal
shareButtons.forEach(button => {
  button.addEventListener("click", () => {
    shareModal.style.display = "block"; // Show the modal
  });
});

// When the "X" is clicked, close the modal
closeBtn.addEventListener("click", () => {
  shareModal.style.display = "none";
});

// If user clicks outside the modal content, close it
window.addEventListener("click", (event) => {
  if (event.target === shareModal) {
    shareModal.style.display = "none";
  }
});


// Handle posting new comments
document.addEventListener("DOMContentLoaded", function () {
  const postButtons = document.querySelectorAll(".post-comment-btn");

  postButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const commentInput = btn.previousElementSibling;
      const commentText = commentInput.value.trim();
      
      // Prevent empty comments
      if (commentText === "") return;

      // Create new comment element
      const newComment = document.createElement("p");
      newComment.className = "comment-text mb-1";
      newComment.innerHTML = `<strong>You</strong> ${DOMPurify.sanitize(commentText)}`;

      // Append to corresponding comments container
      const post = btn.closest(".single-post");
      const commentsContainer = post.querySelector(".comments-container");
      commentsContainer.appendChild(newComment);

      // Clear input
      commentInput.value = "";
    });
  });
});


// Show comment input when 'Add a comment…' is clicked
document.addEventListener('DOMContentLoaded', function() {
    // Show comment input when 'Add a comment…' is clicked
    document.querySelectorAll('.add-comment-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const section = btn.closest('.add-comment-section');
            const form = section.querySelector('.add-comment-form');
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
            if (form.style.display === 'block') {
                form.querySelector('.comment-input').focus();
            }
        });
    });

    // Add typing indicator logic
    document.querySelectorAll('.add-comment-form').forEach(function(form) {
        const input = form.querySelector('.comment-input');
        let typingTimeout;
        // Create or get the typing indicator element for this comment section
        let typingIndicator = form.parentElement.querySelector('.typing-indicator');
        if (!typingIndicator) {
            typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator text-muted';
            typingIndicator.style.fontSize = '13px';
            typingIndicator.style.display = 'none';
            form.parentElement.insertBefore(typingIndicator, form); // Insert above the form
        }
        // Show typing indicator when user types
        input.addEventListener('input', function() {
            if (input.value.trim() !== '') {
                typingIndicator.textContent = 'Monica is typing...'; // Show current user is typing
                typingIndicator.style.display = 'block';
                clearTimeout(typingTimeout);
                // Hide after 2 seconds of no typing
                typingTimeout = setTimeout(function() {
                    typingIndicator.style.display = 'none';
                }, 2000);
            } else {
                typingIndicator.style.display = 'none'; // Hide if input is empty
            }
        });
        // Hide typing indicator on submit
        form.addEventListener('submit', function() {
            typingIndicator.style.display = 'none';
        });
    });

    // Handle comment submission
    document.querySelectorAll('.add-comment-form').forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent form from reloading the page
            const input = form.querySelector('.comment-input');
            const commentText = escapeHTML(input.value.trim()); // Escape input for security
            if (commentText) {
                const section = form.closest('.add-comment-section');
                const commentsList = section.querySelector('.comments-list');
                const commentDiv = document.createElement('div');
                commentDiv.className = 'single-comment';
                const username = '<strong>Monica</strong> ';
                commentDiv.innerHTML = username + commentText;
                commentsList.prepend(commentDiv); // Insert new comment at the top
                input.value = '';
                form.style.display = 'none'; // Hide form after submitting
                // --- Update comment count and button text ---
                const viewCommentsBtn = section.parentElement.querySelector('.view-comments-btn');
                if (viewCommentsBtn) {
                    // Count all comments in this post
                    const count = commentsList.children.length;
                    viewCommentsBtn.textContent = `View all ${count} comments`;
                    viewCommentsBtn.style.display = 'block';
                }
            }
        });
    });

    // --- Show/hide comments when 'View all X comments' is clicked ---
    document.querySelectorAll('.view-comments-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const section = btn.closest('.single-post').querySelector('.add-comment-section');
            const commentsList = section.querySelector('.comments-list');
            if (commentsList.style.display === 'block') {
                commentsList.style.display = 'none';
            } else {
                commentsList.style.display = 'block';
            }
        });
    });

    // --- On page load, set the correct comment count for each post ---
    document.querySelectorAll('.single-post').forEach(function(post) {
        const section = post.querySelector('.add-comment-section');
        const commentsList = section.querySelector('.comments-list');
        const viewCommentsBtn = post.querySelector('.view-comments-btn');
        if (viewCommentsBtn && commentsList) {
            const count = commentsList.children.length;
            viewCommentsBtn.textContent = `View all ${count} comments`;
            // Hide button if no comments
            viewCommentsBtn.style.display = count > 0 ? 'block' : 'none';
        }
    });
});

// Show/hide popup window when search button is clicked
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-button');
    const searchModal = document.getElementById('searchModal');
    const searchCloseBtn = document.querySelector('.search-close-btn');
    const searchInput = document.getElementById('searchInput');
    // Show search modal
    searchBtn.addEventListener('click', function() {
        searchModal.style.display = 'block';
        setTimeout(() => searchInput && searchInput.focus(), 100);
    });
    // Hide search modal when close button is clicked
    searchCloseBtn.addEventListener('click', function() {
        searchModal.style.display = 'none';
        searchInput.value = '';
        document.getElementById('searchResults').innerHTML = '';
    });
    // Hide search modal when clicking outside the modal content
    searchModal.addEventListener('click', function(e) {
        if (e.target === searchModal) {
            searchModal.style.display = 'none';
            searchInput.value = '';
            document.getElementById('searchResults').innerHTML = '';
        }
    });
    // Live search: hide posts that do not match the search text (by caption only)
    function filterPostsBySearch(val) {
        val = val.trim().toLocaleLowerCase();
        const posts = document.querySelectorAll('.single-post');
        let anyVisible = false;
        posts.forEach(post => {
            let found = false;
            // בדוק תגובות
            const commentsList = post.querySelector('.comments-list');
            if (commentsList) {
                const comments = commentsList.querySelectorAll('.single-comment');
                for (let comment of comments) {
                    if (comment.textContent.toLocaleLowerCase().includes(val)) {
                        found = true;
                        break;
                    }
                }
            }
            // בדוק גם את הכיתוב הראשי
            if (!found) {
                const px2mb1s = post.querySelectorAll('p.px-2.mb-1');
                for (let p of px2mb1s) {
                    if (p.querySelector('strong')) {
                        if (p.textContent.toLocaleLowerCase().includes(val)) {
                            found = true;
                            break;
                        }
                    }
                }
            }
            if (val === '' || found) {
                post.style.display = '';
                anyVisible = true;
            } else {
                post.style.display = 'none';
            }
        });
        // הודעה אם אין פוסטים
        const resultsDiv = document.getElementById('searchResults');
        if (!anyVisible) {
            resultsDiv.innerHTML = '<span class="text-danger">לא נמצאו פוסטים מתאימים</span>';
        } else {
            resultsDiv.innerHTML = '';
        }
    }

    // הפעלת סינון גם בלחיצה על כפתור וגם בלחיצה על אנטר
    const searchApplyBtn = document.getElementById('searchApplyBtn');
    searchApplyBtn.addEventListener('click', function() {
        filterPostsBySearch(searchInput.value);
        // סגור את חלון החיפוש
        document.getElementById('searchModal').style.display = 'none';
    });
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            filterPostsBySearch(searchInput.value);
            // סגור את חלון החיפוש
            document.getElementById('searchModal').style.display = 'none';
        }
    });

    // איפוס חיפוש - הצג את כל הפוסטים ונקה שדה חיפוש
    const searchResetBtn = document.getElementById('searchResetBtn');
    searchResetBtn.addEventListener('click', function() {
        document.querySelectorAll('.single-post').forEach(post => post.style.display = '');
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
        document.getElementById('searchModal').style.display = 'none';
    });
    // When closing the search modal, show all posts again
    searchCloseBtn.addEventListener('click', function() {
        document.querySelectorAll('.single-post').forEach(post => post.style.display = '');
    });
    searchModal.addEventListener('click', function(e) {
        if (e.target === searchModal) {
            document.querySelectorAll('.single-post').forEach(post => post.style.display = '');
        }
    });
});

// Helper function to escape HTML special characters (prevents HTML injection)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, function(tag) {
        const charsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        };
        return charsToReplace[tag] || tag;
    });
}

// EVENT LISTENERS
likeButtons.forEach(button => 
    {
    button.addEventListener('click', () => toggleLike(button)); // מאזין ללחיצה על כפתור הלייק
// --- FILTER POSTS BY TYPE ---
document.addEventListener('DOMContentLoaded', function() {
  const filterSelect = document.getElementById('postTypeFilter');
  if (filterSelect) {
    filterSelect.addEventListener('change', function() {
      const selected = filterSelect.value;
      document.querySelectorAll('.single-post').forEach(post => {
        // post with picture
        const hasImage = post.querySelector('img.post-image');
        // post with video
        const hasVideo = post.querySelector('video');
        // post text only (no image and no video)
        const isTextOnly = !hasImage && !hasVideo;
        if (
          selected === 'all' ||
          (selected === 'image' && hasImage) ||
          (selected === 'video' && hasVideo) ||
          (selected === 'text' && isTextOnly)
        ) {
          post.style.display = '';
        } else {
          post.style.display = 'none';
        }
      });
    });
  }
});
});

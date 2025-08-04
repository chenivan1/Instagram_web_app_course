// Create Post Page JavaScript

let selectedImageData = null;
let availableCommunities = [];

// DOM Elements
const communitySelect = document.getElementById('communitySelect');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');
const postTitle = document.getElementById('postTitle');
const titleCharCount = document.getElementById('titleCharCount');
const submitBtn = document.getElementById('submitBtn');
const createPostForm = document.getElementById('createPostForm');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserCommunities();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Image input change
    imageInput.addEventListener('change', handleImageUpload);
    
    // Title character counting
    postTitle.addEventListener('input', updateCharacterCount);
    
    // Form submission
    createPostForm.addEventListener('submit', handleFormSubmit);
    
    // Community selection validation
    communitySelect.addEventListener('change', validateForm);
    
    // Form validation on input
    imageInput.addEventListener('change', validateForm);
}

// Load user's subscribed communities
function loadUserCommunities() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/subscriptions', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                availableCommunities = JSON.parse(xhr.responseText);
                populateCommunitySelect();
            } else {
                showAlert('Failed to load communities. Please refresh the page.', 'danger');
            }
        }
    };
    xhr.send();
}

// Populate community select dropdown
function populateCommunitySelect() {
    communitySelect.innerHTML = '<option value="">Choose a community...</option>';
    
    if (availableCommunities.length === 0) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = 'No subscribed communities found';
        communitySelect.appendChild(option);
        
        showAlert('You need to subscribe to at least one community to create posts. <a href="/communities-management" class="alert-link">Browse Communities</a>', 'info');
        return;
    }
    
    availableCommunities.forEach(community => {
        const option = document.createElement('option');
        option.value = community.id;
        option.textContent = community.name;
        communitySelect.appendChild(option);
    });
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (!file) {
        clearImagePreview();
        return;
    }
    
    // Validate file
    if (!validateImageFile(file)) {
        clearImagePreview();
        return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = function(e) {
        selectedImageData = e.target.result;
        showImagePreview(selectedImageData);
        validateForm();
    };
    reader.onerror = function() {
        showAlert('Failed to read image file. Please try again.', 'danger');
        clearImagePreview();
    };
    reader.readAsDataURL(file);
}

// Validate image file
function validateImageFile(file) {
    const imageInput = document.getElementById('imageInput');
    const imageError = document.getElementById('imageError');
    
    // Clear previous errors
    imageInput.classList.remove('is-invalid');
    imageError.textContent = '';
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        imageInput.classList.add('is-invalid');
        imageError.textContent = 'Please select a valid image file (JPG, PNG, or GIF)';
        return false;
    }
    
    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        imageInput.classList.add('is-invalid');
        imageError.textContent = 'Image file size must be under 5MB';
        return false;
    }
    
    return true;
}

// Show image preview
function showImagePreview(imageData) {
    previewImage.src = imageData;
    imagePreview.style.display = 'block';
}

// Clear image preview
function clearImagePreview() {
    selectedImageData = null;
    imagePreview.style.display = 'none';
    previewImage.src = '';
    imageInput.value = '';
    validateForm();
}

// Remove image
function removeImage() {
    clearImagePreview();
}

// Update character count
function updateCharacterCount() {
    const currentLength = postTitle.value.length;
    titleCharCount.textContent = currentLength;
    
    const charCountElement = document.querySelector('.character-count');
    if (currentLength > 90) {
        charCountElement.classList.add('warning');
    } else {
        charCountElement.classList.remove('warning');
    }
}

// Validate form
function validateForm() {
    const isCommunitySelected = communitySelect.value !== '';
    const isImageSelected = selectedImageData !== null;
    const isTitleValid = postTitle.value.length <= 100;
    
    const isValid = isCommunitySelected && isImageSelected && isTitleValid;
    submitBtn.disabled = !isValid;
    
    return isValid;
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showAlert('Please fill in all required fields correctly.', 'danger');
        return;
    }
    
    // Validate individual fields
    if (!validateCommunitySelection() || !validateTitle()) {
        return;
    }
    
    createPost();
}

// Validate community selection
function validateCommunitySelection() {
    const communityError = document.getElementById('communityError');
    communitySelect.classList.remove('is-invalid');
    communityError.textContent = '';
    
    if (!communitySelect.value) {
        communitySelect.classList.add('is-invalid');
        communityError.textContent = 'Please select a community';
        return false;
    }
    
    return true;
}

// Validate title
function validateTitle() {
    const title = postTitle.value.trim();
    
    if (title.length > 100) {
        postTitle.classList.add('is-invalid');
        showAlert('Title must not exceed 100 characters', 'danger');
        return false;
    }
    
    postTitle.classList.remove('is-invalid');
    return true;
}

// Create post
function createPost() {
    // Show loading state
    setLoadingState(true);
    
    const postData = {
        title: postTitle.value.trim(),
        imageData: selectedImageData,
        communityId: communitySelect.value
    };
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/posts', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            setLoadingState(false);
            
            if (xhr.status === 201) {
                const response = JSON.parse(xhr.responseText);
                showSuccessModal();
            } else {
                const error = JSON.parse(xhr.responseText);
                showAlert(error.error || 'Failed to create post. Please try again.', 'danger');
                
                // Handle specific validation errors
                if (error.error && error.error.includes('subscribed')) {
                    communitySelect.classList.add('is-invalid');
                    document.getElementById('communityError').textContent = error.error;
                }
            }
        }
    };
    
    xhr.onerror = function() {
        setLoadingState(false);
        showAlert('Network error. Please check your connection and try again.', 'danger');
    };
    
    xhr.send(JSON.stringify(postData));
}

// Set loading state
function setLoadingState(isLoading) {
    const buttonText = document.querySelector('.button-text');
    const spinner = document.querySelector('.spinner-border');
    
    if (isLoading) {
        buttonText.classList.add('d-none');
        spinner.classList.remove('d-none');
        submitBtn.disabled = true;
        
        // Disable all form inputs
        const formInputs = createPostForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => input.disabled = true);
    } else {
        buttonText.classList.remove('d-none');
        spinner.classList.add('d-none');
        
        // Re-enable form inputs
        const formInputs = createPostForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => input.disabled = false);
        
        validateForm(); // Re-validate to set correct button state
    }
}

// Show success modal
function showSuccessModal() {
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
}

// Create another post
function createAnother() {
    // Reset form
    createPostForm.reset();
    clearImagePreview();
    updateCharacterCount();
    
    // Clear validation states
    const invalidElements = document.querySelectorAll('.is-invalid');
    invalidElements.forEach(el => el.classList.remove('is-invalid'));
    
    const errorElements = document.querySelectorAll('.invalid-feedback');
    errorElements.forEach(el => el.textContent = '');
    
    // Hide modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('successModal'));
    modal.hide();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show alert
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
    
    // Auto dismiss after 7 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 7000);
    
    // Scroll to alert
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle page navigation warnings
window.addEventListener('beforeunload', function(event) {
    if (selectedImageData || postTitle.value.trim() || communitySelect.value) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
    }
});

// Initialize drag and drop (optional enhancement)
function initializeDragAndDrop() {
    const dropZone = document.querySelector('.form-control[type="file"]');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        dropZone.classList.add('drag-over');
    }
    
    function unhighlight(e) {
        dropZone.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            imageInput.files = files;
            handleImageUpload({ target: { files: files } });
        }
    }
}

// Initialize drag and drop on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDragAndDrop();
});
const form_listener = document.getElementById("form_login")
const messageDiv = document.getElementById("login-message")

function showMessage(message, isError = false) {
    messageDiv.textContent = message
    messageDiv.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`
    messageDiv.style.display = 'block'
}

function hideMessage() {
    messageDiv.style.display = 'none'
}

form_listener.addEventListener('submit', function(e) {
    e.preventDefault()
    
    // Check if form is valid (including email pattern and password length validation)
    const form = document.getElementById("form_login")
    if (!form.checkValidity()) {
        form.reportValidity() // This will show the HTML5 validation messages
        return
    }
    
    // Get form data
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    
    // Create AJAX request
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/user/login', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText)
                    if (data.success) {
                        // Login successful
                        showMessage('Login successful! Redirecting...', false)
                        // Redirect to home page after a short delay
                        setTimeout(() => {
                            window.location.href = "/home"
                        }, 1500)
                    } else {
                        // Login failed
                        showMessage(data.error || 'Login failed. Please check your credentials.', true)
                    }
                } catch (error) {
                    // JSON parsing error
                    showMessage('Login failed. Please try again later.', true)
                    console.error('JSON parsing error:', error)
                }
            } else if (xhr.status === 404) {
                try {
                    const data = JSON.parse(xhr.responseText)
                    showMessage(data.error || 'User not found or invalid credentials.', true)
                } catch (error) {
                    showMessage('User not found or invalid credentials.', true)
                }
            } else {
                // Other HTTP errors
                showMessage('Login failed. Please try again later.', true)
                console.error('HTTP error:', xhr.status, xhr.statusText)
            }
        }
    }
    
    xhr.onerror = function() {
        // Network error
        showMessage('Login failed. Please check your internet connection.', true)
        console.error('Network error')
    }
    
    // Send the request
    xhr.send(JSON.stringify({ email, password }))
})


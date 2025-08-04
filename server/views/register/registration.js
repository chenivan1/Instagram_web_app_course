document.addEventListener('DOMContentLoaded', function () {
    const form_listener = document.getElementById("form_login")
    const messageDiv = document.getElementById("registration-message")

    // Debug logging
    console.log('Form element found:', form_listener)
    console.log('Message div found:', messageDiv)

    if (!form_listener) {
        console.error('Form element not found!')
        return
    }

    if (!messageDiv) {
        console.error('Message div not found!')
        return
    }

    function showMessage(message, isError = false) {
        messageDiv.textContent = message
        messageDiv.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`
        messageDiv.style.display = 'block'
    }

    function hideMessage() {
        messageDiv.style.display = 'none'
    }

    form_listener.addEventListener('submit', function (e) {
        e.preventDefault()
        console.log('Form submitted!')

        // Check if form is valid (including email pattern and password length validation)
        const form = document.getElementById("form_login")
        if (!form.checkValidity()) {
            form.reportValidity() // This will show the HTML5 validation messages
            return
        }

        // Get form data
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value
        const fullName = document.getElementById("full_name").value
        const addressName = document.getElementById("address_name").value
        const latitude = parseFloat(document.getElementById("latitude").value)
        const longitude = parseFloat(document.getElementById("longitude").value)

        // Additional validation for latitude and longitude
        if (isNaN(latitude) || isNaN(longitude)) {
            showMessage('Please enter valid numeric values for latitude and longitude.', true)
            return
        }

        if (latitude < -90 || latitude > 90) {
            showMessage('Latitude must be between -90 and 90 degrees.', true)
            return
        }

        if (longitude < -180 || longitude > 180) {
            showMessage('Longitude must be between -180 and 180 degrees.', true)
            return
        }

        // Create address object
        const address = {
            name: addressName,
            latitude: latitude,
            longitude: longitude
        }

        // Create AJAX request
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/user/register', true)
        xhr.setRequestHeader('Content-Type', 'application/json')

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 201) {
                    try {
                        const data = JSON.parse(xhr.responseText)
                        if (data.success) {
                            // Registration successful
                            showMessage('Registration successful! Redirecting to login...', false)
                            // Redirect to login page after a short delay
                            setTimeout(() => {
                                window.location.href = "/login"
                            }, 1500)
                        } else {
                            // Registration failed
                            showMessage(data.error || 'Registration failed. Please try again.', true)
                        }
                    } catch (error) {
                        // JSON parsing error
                        showMessage('Registration failed. Please try again later.', true)
                        console.error('JSON parsing error:', error)
                    }
                } else if (xhr.status === 400) {
                    try {
                        const data = JSON.parse(xhr.responseText)
                        showMessage(data.error || 'Invalid registration data.', true)
                    } catch (error) {
                        showMessage('Invalid registration data.', true)
                    }
                } else if (xhr.status === 409) {
                    try {
                        const data = JSON.parse(xhr.responseText)
                        showMessage(data.error || 'User already exists with this email.', true)
                    } catch (error) {
                        showMessage('User already exists with this email.', true)
                    }
                } else {
                    // Other HTTP errors
                    showMessage('Registration failed. Please try again later.', true)
                    console.error('HTTP error:', xhr.status, xhr.statusText)
                }
            }
        }

        xhr.onerror = function () {
            // Network error
            showMessage('Registration failed. Please check your internet connection.', true)
            console.error('Network error')
        }

        // Send the request
        console.log('Sending registration request:', { email, full_name: fullName, address })
        xhr.send(JSON.stringify({
            email,
            password,
            full_name: fullName,
            address
        }))
    })
})

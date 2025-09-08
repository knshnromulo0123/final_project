document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('login-error');
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    if (!email || !password) {
        errorDiv.textContent = 'Please enter your email and password.';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        console.log('Attempting login...');
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        console.log('Login response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('Login successful:', data);
            
            // Store user data in localStorage
            const userData = {
                id: data.id,
                name: data.firstName + ' ' + data.lastName,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Double-check session is established
            const checkSession = await fetch('/api/users/me', {
                credentials: 'include'
            });
            
            if (checkSession.ok) {
                console.log('Session verified');
                // Check if we need to redirect to a specific page
                const params = new URLSearchParams(window.location.search);
                const redirect = params.get('redirect');
                if (redirect && !redirect.includes('login.html')) {
                    // Ensure the redirect URL is relative and safe
                    window.location.href = redirect;
                } else {
                    // No redirect specified or invalid redirect, go to index
                    window.location.href = 'index.html';
                }
            } else {
                throw new Error('Session verification failed');
            }
        } else {
            let errorMsg = 'Invalid email or password';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch {
                errorMsg = await response.text() || errorMsg;
            }
            console.error('Login failed:', errorMsg);
            errorDiv.textContent = errorMsg;
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'An error occurred during login. Please try again.';
        errorDiv.style.display = 'block';
    }
});
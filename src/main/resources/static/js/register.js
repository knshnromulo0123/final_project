document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName  = document.getElementById('lastName').value.trim();    const email     = document.getElementById('registerEmail').value.trim();
    const password  = document.getElementById('registerPassword').value;
    const phone     = document.getElementById('phone').value.trim();

    console.log('Form values:', {
        firstName: firstName ? 'filled' : 'empty',
        lastName: lastName ? 'filled' : 'empty',
        email: email ? 'filled' : 'empty',
        password: password ? 'filled' : 'empty',
        phone: phone ? 'filled' : 'empty'
    });

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
        console.log('Missing required fields:', {
            firstName: !firstName,
            lastName: !lastName,
            email: !email,
            password: !password
        });
        alert('Please fill in all required fields.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    try {
        console.log('Sending registration request...');
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password, phone })
        });

        if (response.ok) {
            alert('Registration successful! Please log in.');
            window.location.href = 'login.html';
        } else {
            let errorMsg = 'Registration failed.';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
                console.log('Registration failed:', errorData);
            } catch {
                errorMsg = await response.text() || errorMsg;
                console.log('Registration failed:', errorMsg);
            }
            alert(errorMsg);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
});
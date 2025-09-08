document.addEventListener('DOMContentLoaded', function() {
    // Get all required elements
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Check if all required elements exist
    if (!loginTab || !registerTab || !loginForm || !registerForm) {
        console.error('Missing required elements for tab switching. Available elements:', {
            loginTab, registerTab, loginForm, registerForm
        });
        return;
    }

    // Function to switch tabs with error handling
    function switchTab(activeTab, inactiveTab, showForm, hideForm) {
        try {
            activeTab.classList.add('active');
            inactiveTab.classList.remove('active');
            showForm.classList.remove('hidden');
            hideForm.classList.add('hidden');
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    }

    // Add click handlers for tabs
    loginTab.addEventListener('click', function() {
        switchTab(loginTab, registerTab, loginForm, registerForm);
    });

    registerTab.addEventListener('click', function() {
        switchTab(registerTab, loginTab, registerForm, loginForm);
    });

    // Initialize form visibility based on URL hash
    if (window.location.hash === '#register') {
        switchTab(registerTab, loginTab, registerForm, loginForm);
    }
});

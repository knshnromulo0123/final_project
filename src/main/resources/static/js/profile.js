// Profile page functionality
function initializeProfile() {
    console.log("Initializing profile...");
    
    // Only check for elements that exist in the new profile layout
    const requiredElements = [
        'user-name', 
        'user-email', 
        'display-name', 
        'display-email', 
        'display-phone',
        'personal-info'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error("Missing required elements:", missingElements);
        return;
    }

    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    console.log("Current user data:", currentUser);

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    function displayUserInfo() {
        // Get user phone from localStorage or set default
        const phone = currentUser.phone || 'Not provided';
        const fullName = `${currentUser.firstName} ${currentUser.lastName}`;
        const userElements = {
            'user-name': fullName,
            'user-email': currentUser.email,
            'display-name': fullName,
            'display-email': currentUser.email,
            'display-phone': phone
        };
        Object.entries(userElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // Display user information
    displayUserInfo();

    // Handle sign out
    const signOutBtn = document.getElementById("sign-out-btn");
    if (signOutBtn) {
        signOutBtn.addEventListener("click", handleSignOut);
    }
}

function handleSignOut(e) {
    e.preventDefault();
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

// Wait for DOM to be ready, then initialize
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeProfile);
} else {
    initializeProfile();
}

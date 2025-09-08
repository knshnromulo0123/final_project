// Admin login functionality
document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin login script loaded");
  
  // Handle admin login form if present
  const adminLoginForm = document.getElementById("admin-login-form");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", handleAdminLogin);
  }
});

function handleAdminLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById("admin-username").value;
  const password = document.getElementById("admin-password").value;
  const errorDiv = document.getElementById("login-error");
  
  // Hide any previous error
  errorDiv.style.display = "none";
  
  // Basic validation
  if (!username || !password) {
    showError("Please enter both email and password");
    return;
  }

  fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'
  })
  .then(async res => {
    if (res.ok) {
      // Login successful
      localStorage.setItem("adminLoggedIn", "true");
      localStorage.setItem("adminUser", username);
      showNotification("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "inventory.html";
      }, 1000);
    } else {
      // Login failed
      const msg = await res.text();
      showError(msg || "Invalid credentials. Please try again.");
    }
  })
  .catch(error => {
    console.error("Login error:", error);
    showError("Network error. Please try again.");
  });
}

function showError(message) {
  const errorDiv = document.getElementById("login-error");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function showNotification(message, type = "success") {
  console.log(`${type}: ${message}`);
  const errorDiv = document.getElementById("login-error");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
  errorDiv.style.color = type === "success" ? "green" : "red";
}

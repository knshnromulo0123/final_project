// Main JavaScript file for common functionality

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  checkAuthStatus()

  // Initialize cart count
  updateCartCount()

  // Add smooth scrolling to anchor links
  initSmoothScrolling()
})

// Check authentication status. If no local storage entry exists, probe the server
async function checkAuthStatus() {
  const signInBtn = document.querySelector(".user-actions a")
  if (!signInBtn) return

  const user = localStorage.getItem("currentUser")
  if (user) {
    try {
      const userData = JSON.parse(user)
      signInBtn.textContent = userData.name || `${userData.firstName} ${userData.lastName}`
      signInBtn.href = "profile.html"
      return
    } catch (e) {
      console.error('Failed to parse currentUser from localStorage', e)
      // fall through to server probe
    }
  }

  // No local user cached: call server to verify session and fetch user info
  try {
    const resp = await fetch('/api/users/me', { credentials: 'include' })
    if (resp.ok) {
      const data = await resp.json()
      const userData = {
        id: data.id,
        name: data.username || (data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : data.email),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone
      }
      localStorage.setItem('currentUser', JSON.stringify(userData))
      signInBtn.textContent = userData.name
      signInBtn.href = 'profile.html'
    } else {
      // Not logged in; leave the Sign In link as-is
      // Optionally, ensure it points to login page
      signInBtn.href = 'login.html'
    }
  } catch (err) {
    console.error('Error checking auth status:', err)
  }
}

// Update cart count in header
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const cartLinks = document.querySelectorAll('a[href="cart.html"]')

  cartLinks.forEach((link) => {
    const count = cart.reduce((total, item) => total + item.quantity, 0)
    if (count > 0) {
      link.textContent = `Cart (${count})`
    }
  })
}

// Initialize smooth scrolling
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]')

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// Utility function to show notifications
function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === "success" ? "#28a745" : "#dc3545"};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `

  document.body.appendChild(notification)

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Add CSS animations
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`
document.head.appendChild(style)

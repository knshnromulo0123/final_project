// Admin inventory management functionality

console.log("Admin inventory script loaded")

// Global variables
let currentProducts = []
let isEditMode = false
let editingProductId = null

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing inventory page...")

  // Check admin authentication
  if (!checkAdminAuth()) {
    console.log("Not authenticated, redirecting...")
    window.location.href = "../index.html"
    return
  }

  // Initialize the page
  initializePage()
})

function checkAdminAuth() {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true"
  console.log("Admin logged in:", isLoggedIn)
  return isLoggedIn
}

function initializePage() {
  console.log("Initializing inventory page...")

  
  initializeProducts()
  loadInventory()
  setupEventListeners()

  console.log("Inventory page initialized successfully")
}

function setupEventListeners() {
  // Add Product Button
  const addProductBtn = document.getElementById("add-product-btn")
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      console.log("Add product button clicked")
      openProductModal()
    })
  }

  // Export Button
  const exportBtn = document.getElementById("export-inventory-btn")
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      console.log("Export button clicked")
      exportInventory()
    })
  }

  // Search Input
  const searchInput = document.getElementById("search-products")
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      console.log("Search input changed:", this.value)
      applyFilters()
    })
  }

  // Category Filter
  const categoryFilter = document.getElementById("category-filter")
  if (categoryFilter) {
    categoryFilter.addEventListener("change", function () {
      console.log("Category filter changed:", this.value)
      applyFilters()
    })
  }

  // Stock Filter
  const stockFilter = document.getElementById("stock-filter")
  if (stockFilter) {
    stockFilter.addEventListener("change", function () {
      console.log("Stock filter changed:", this.value)
      applyFilters()
    })
  }

  // Product Form
  const productForm = document.getElementById("product-form")
  if (productForm) {
    productForm.addEventListener("submit", (e) => {
      e.preventDefault()
      console.log("Product form submitted")
      saveProduct()
    })
  }

  // Modal Close Button
  const modalClose = document.querySelector(".modal-close")
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      console.log("Modal close button clicked")
      closeProductModal()
    })
  }

  // Logout Button
  const logoutBtn = document.getElementById("admin-logout")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()
      console.log("Logout button clicked")
      handleLogout()
    })
  }

  // Modal background click to close
  const modal = document.getElementById("product-modal")
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeProductModal()
      }
    })
  }
}

function initializeProducts() {
  let products = JSON.parse(localStorage.getItem("products")) || []
  return products
}

// Replace all localStorage product operations with backend API calls

async function fetchProducts() {
  try {
    const response = await fetch('/api/products')
    if (!response.ok) throw new Error('Failed to fetch products')
    return await response.json()
  } catch (err) {
    showNotification('Error loading products', 'error')
    return []
  }
}

async function addProductAPI(product) {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    })
    if (!response.ok) throw new Error('Failed to add product')
    return await response.json()
  } catch (err) {
    showNotification('Error adding product', 'error')
    return null
  }
}

async function updateProductAPI(id, product) {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    })
    if (!response.ok) throw new Error('Failed to update product')
    return await response.json()
  } catch (err) {
    showNotification('Error updating product', 'error')
    return null
  }
}

// Add this function to support product deletion
async function deleteProductAPI(id) {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return true;
  } catch (err) {
    showNotification('Error deleting product', 'error');
    console.error('Delete product error:', err);
    return false;
  }
}

// Override loadInventory to use backend
async function loadInventory() {
  console.log('Loading inventory from backend...')
  const products = await fetchProducts()
  currentProducts = products
  displayProducts(currentProducts)
}

// Override saveProduct to use backend and send all fields
async function saveProduct() {
  console.log('Saving product to backend...')
  const id = editingProductId
  const name = document.getElementById('product-name').value.trim()
  const category = document.getElementById('product-category').value
  const price = Number.parseFloat(document.getElementById('product-price').value)
  const stock = Number.parseInt(document.getElementById('product-stock').value)
  const description = document.getElementById('product-description')?.value.trim() || ''
  const sku = document.getElementById('product-sku')?.value || ''
  const status = document.getElementById('product-status')?.value || ''
  const image = document.getElementById('product-image')?.value || ''
  const brand = document.getElementById('product-brand')?.value || ''
  const features = document.getElementById('product-features')?.value || ''
  const specifications = document.getElementById('product-specifications')?.value || ''

  if (!name || !category || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
    showNotification('Please fill all required fields correctly', 'error')
    return
  }

  // Only include id for update, never for add
  const productData = { name, category, price, stock, description, sku, status, image, brand, features, specifications }

  if (isEditMode && editingProductId) {
    // For update, id is in the URL, not in the body
    const updated = await updateProductAPI(editingProductId, productData)
    if (updated) showNotification(`${name} updated successfully!`)
  } else {
    // For add, do NOT send id in the body
    const added = await addProductAPI(productData)
    if (added) showNotification(`${name} added successfully!`)
  }
  closeProductModal()
  loadInventory()
}

// Refactor editProduct to fetch product from backend and open modal with all fields
async function editProduct(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`)
    if (!response.ok) throw new Error('Failed to fetch product')
    const product = await response.json()
    isEditMode = true
    editingProductId = product.id
    document.getElementById('product-name').value = product.name || ''
    document.getElementById('product-category').value = product.category || ''
    document.getElementById('product-price').value = product.price || ''
    document.getElementById('product-stock').value = product.stock || ''
    document.getElementById('product-description').value = product.description || ''
    if(document.getElementById('product-sku')) document.getElementById('product-sku').value = product.sku || ''
    if(document.getElementById('product-status')) document.getElementById('product-status').value = product.status || ''
    if(document.getElementById('product-image')) document.getElementById('product-image').value = product.image || ''
    if(document.getElementById('product-brand')) document.getElementById('product-brand').value = product.brand || ''
    if(document.getElementById('product-features')) document.getElementById('product-features').value = product.features || ''
    if(document.getElementById('product-specifications')) document.getElementById('product-specifications').value = product.specifications || ''
    openProductModal(product)
  } catch (err) {
    showNotification('Error loading product for edit', 'error')
  }
}

// Refactor deleteProduct to use backend and refresh
async function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    const success = await deleteProductAPI(productId)
    if (success) {
      showNotification('Product deleted successfully!')
      loadInventory()
    }
  }
}

// Refactor exportInventory to use backend data
async function exportInventory() {
  console.log('Exporting inventory...')
  const products = await fetchProducts()
  if (!products || products.length === 0) {
    showNotification('No products to export', 'error')
    return
  }
  const headers = ['ID', 'Name', 'Category', 'Price', 'Stock', 'Status']
  const csvContent = [
    headers.join(','),
    ...products.map((product) => {
      const stockStatus = product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock'
      return [
        product.id,
        `"${product.name}"`,
        `"${product.category}"`,
        product.price,
        product.stock,
        `"${stockStatus}"`,
      ].join(',')
    }),
  ].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
  showNotification('Inventory exported successfully!')
}

// On page load, fetch products from backend
window.addEventListener('load', () => {
  console.log('Page loaded, fetching products...')
  loadInventory()
})

// Admin dashboard navigation
const adminDashboardLinks = document.querySelectorAll('.admin-dashboard-link')
adminDashboardLinks.forEach((link) => {
  link.addEventListener('click', function () {
    const target = this.getAttribute('data-target')
    console.log('Navigating to:', target)

    // Hide all dashboard sections
    const sections = document.querySelectorAll('.admin-dashboard-section')
    sections.forEach((section) => {
      section.style.display = 'none'
    })

    // Show the target section
    const targetSection = document.getElementById(target)
    if (targetSection) {
      targetSection.style.display = 'block'
      console.log('Showing section:', target)
    } else {
      console.warn('Target section not found:', target)
    }
  })
})

// Initial setup: Hide all sections except the first
const initialSection = document.querySelector('.admin-dashboard-section')
if (initialSection) {
  initialSection.style.display = 'block'
}

// Admin user management (simplified)
// In a real application, this would fetch users from an API
const adminUsers = [
  { id: 1, username: 'admin', role: 'Administrator' },
  { id: 2, username: 'manager', role: 'Manager' },
]

function loadAdminUsers() {
  const userTableBody = document.getElementById('admin-user-table-body')
  if (!userTableBody) return

  // Clear existing rows
  userTableBody.innerHTML = ''

  adminUsers.forEach((user) => {
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${user.role}</td>
      <td>
        <button class="btn btn-small" onclick="editUser(${user.id})">Edit</button>
        <button class="btn btn-small btn-outline" onclick="deleteUser(${user.id})" style="margin-left: 0.5rem;">Delete</button>
      </td>
    `
    userTableBody.appendChild(row)
  })
}

function editUser(userId) {
  const user = adminUsers.find((u) => u.id === userId)
  if (user) {
    document.getElementById('admin-username').value = user.username
    document.getElementById('admin-role').value = user.role
    document.getElementById('admin-user-id').value = user.id
    openAdminUserModal()
  }
}

function deleteUser(userId) {
  const userIndex = adminUsers.findIndex((u) => u.id === userId)
  if (userIndex !== -1) {
    adminUsers.splice(userIndex, 1)
    loadAdminUsers()
    showNotification('User deleted successfully!')
  }
}

function openAdminUserModal() {
  const modal = document.getElementById('admin-user-modal')
  if (modal) {
    modal.classList.remove('hidden')
    modal.style.display = 'flex'
  }
}

function closeAdminUserModal() {
  const modal = document.getElementById('admin-user-modal')
  if (modal) {
    modal.classList.add('hidden')
    modal.style.display = 'none'
  }
}

document.getElementById('admin-user-form')?.addEventListener('submit', function (e) {
  e.preventDefault()
  const userId = document.getElementById('admin-user-id').value
  const username = document.getElementById('admin-username').value
  const role = document.getElementById('admin-role').value

  if (userId) {
    // Update user
    const user = adminUsers.find((u) => u.id === parseInt(userId))
    if (user) {
      user.username = username
      user.role = role
      showNotification('User updated successfully!')
    }
  } else {
    // Add new user
    const newUser = {
      id: adminUsers.length + 1,
      username: username,
      role: role,
    }
    adminUsers.push(newUser)
    showNotification('User added successfully!')
  }

  closeAdminUserModal()
  loadAdminUsers()
})

// Initial load
loadAdminUsers()

function exportInventory() {
  console.log("Exporting inventory...")
  const products = JSON.parse(localStorage.getItem("products")) || []

  if (products.length === 0) {
    showNotification("No products to export", "error")
    return
  }

  const headers = ["ID", "Name", "Category", "Price", "Stock", "Status"]
  const csvContent = [
    headers.join(","),
    ...products.map((product) => {
      const stockStatus = product.stock === 0 ? "Out of Stock" : product.stock < 10 ? "Low Stock" : "In Stock"
      return [
        product.id,
        `"${product.name}"`,
        `"${getCategoryName(product.category)}"`,
        product.price,
        product.stock,
        `"${stockStatus}"`,
      ].join(",")
    }),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `inventory_${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)

  showNotification("Inventory exported successfully!")
}

function handleLogout() {
  localStorage.removeItem("adminLoggedIn")
  localStorage.removeItem("adminUser")
  showNotification("Logged out successfully!")
  setTimeout(() => {
    window.location.href = "index.html"
  }, 1000)
}

function getBrandByCategory(category) {
  const brandMap = {
    weights: "nike",
    apparel: "adidas",
    balls: "nike",
    accessories: "puma",
  }
  return brandMap[category] || "generic"
}

function getDefaultFeatures(category) {
  const featureMap = {
    weights: ["Durable construction", "Professional grade", "Non-slip grip"],
    apparel: ["Moisture-wicking fabric", "Comfortable fit", "Quick-dry technology"],
    balls: ["Official size and weight", "Superior grip", "Durable material"],
    accessories: ["High quality", "Versatile use", "Long-lasting"],
  }
  return featureMap[category] || ["High quality", "Durable", "Professional grade"]
}

function getDefaultSpecifications(category, name) {
  const specMap = {
    weights: {
      brand: "Nike",
      material: "Cast Iron",
      weight: "Variable",
      dimensions: "Standard",
      warranty: "2 years",
    },
    apparel: {
      brand: "Adidas",
      material: "Polyester blend",
      weight: "200g",
      dimensions: "Various sizes",
      warranty: "6 months",
    },
    balls: {
      brand: "Nike",
      material: "Synthetic leather",
      weight: "Official weight",
      dimensions: "Official size",
      warranty: "1 year",
    },
    accessories: {
      brand: "Puma",
      material: "Mixed materials",
      weight: "Lightweight",
      dimensions: "Standard",
      warranty: "1 year",
    },
  }

  return (
    specMap[category] || {
      brand: "Generic Brand",
      material: "Standard Material",
      weight: "1kg",
      dimensions: "Standard Size",
      warranty: "1 year",
    }
  )
}

function showNotification(message, type = "success") {
  console.log(`Notification (${type}): ${message}`)

  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".admin-notification")
  existingNotifications.forEach((notification) => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification)
    }
  })

  // Create notification element
  const notification = document.createElement("div")
  notification.className = `admin-notification ${type}`
  notification.textContent = message

  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 2rem;
    background: ${type === "success" ? "#28a745" : "#dc3545"};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 1001;
    animation: slideIn 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
    font-weight: 500;
    border-left: 4px solid rgba(255, 255, 255, 0.3);
  `

  document.body.appendChild(notification)

  // Remove after 3 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.animation = "slideOut 0.3s ease"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }
  }, 3000)
}

// Add CSS animations if not already present
if (!document.querySelector("#admin-notification-styles")) {
  const style = document.createElement("style")
  style.id = "admin-notification-styles"
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
}

// Helper functions for product management
function getBrandFromCategory(category) {
    const brandMap = {
        'weights': 'Nike',
        'apparel': 'Adidas',
        'balls': 'Spalding',
        'accessories': 'Reebok'
    };
    return brandMap[category] || 'Generic Brand';
}

function getDefaultImageForCategory(category) {
    const imageMap = {
        'weights': 'placeholders/Hex-Dumbbell-set-with-stand-e168.png',
        'apparel': 'placeholders/shorts.jpg',
        'balls': 'placeholders/basketball.jpg',
        'accessories': 'placeholders/jump rope (1).webp'
    };
    return imageMap[category] || 'placeholders/default.jpg';
}

function updateInventoryStats(products) {
    const stats = products.reduce((acc, product) => {
        acc.total++;
        acc.value += product.price * product.stock;
        if (product.stock === 0) acc.outOfStock++;
        else if (product.stock <= 5) acc.lowStock++;
        return acc;
    }, { total: 0, lowStock: 0, outOfStock: 0, value: 0 });

    // Update stats display
    const elements = {
        total: document.getElementById('total-products'),
        lowStock: document.getElementById('low-stock'),
        outOfStock: document.getElementById('out-of-stock'),
        value: document.getElementById('total-value')
    };

    if (elements.total) elements.total.textContent = stats.total;
    if (elements.lowStock) elements.lowStock.textContent = stats.lowStock;
    if (elements.outOfStock) elements.outOfStock.textContent = stats.outOfStock;
    if (elements.value) elements.value.textContent = `₱${stats.value.toFixed(2)}`;
}

// Ensure displayProducts is defined and attached to window
function displayProducts(products) {
  const tableBody = document.getElementById('inventory-table-body')
  if (!tableBody) return
  tableBody.innerHTML = ''
  if (!products || products.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #666;">No products found.</td></tr>`
    return
  }
  products.forEach((product) => {
    const row = document.createElement('tr')
    let stockStatus = 'in-stock'
    let stockStatusText = 'In Stock'
    if (product.stock === 0) {
      stockStatus = 'out-of-stock'
      stockStatusText = 'Out of Stock'
    } else if (product.stock < 10) {
      stockStatus = 'low-stock'
      stockStatusText = 'Low Stock'
    }
    row.innerHTML = `
      <td>#${String(product.id).padStart(3, '0')}</td>
      <td><img src="${product.image || 'placeholders/default.jpg'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>₱${product.price.toFixed(2)}</td>
      <td>${product.stock}</td>
      <td><span class="status ${stockStatus}">${stockStatusText}</span></td>
      <td>
        <button class="btn btn-small" onclick="editProduct(${product.id})">Edit</button>
        <button class="btn btn-small btn-outline" onclick="deleteProduct(${product.id})" style="margin-left: 0.5rem;">Delete</button>
      </td>
    `
    tableBody.appendChild(row)
  })
}
window.displayProducts = displayProducts

// Modal logic for opening/closing and populating the product form
function openProductModal(product = null) {
  const modal = document.getElementById('product-modal')
  const form = document.getElementById('product-form')
  if (!modal || !form) return

  // Reset form fields
  form.reset()

  // If editing, fill in the fields
  if (product) {
    document.getElementById('product-name').value = product.name || ''
    document.getElementById('product-category').value = product.category || ''
    document.getElementById('product-price').value = product.price || ''
    document.getElementById('product-stock').value = product.stock || ''
    document.getElementById('product-description').value = product.description || ''
    if(document.getElementById('product-sku')) document.getElementById('product-sku').value = product.sku || ''
    if(document.getElementById('product-status')) document.getElementById('product-status').value = product.status || ''
    if(document.getElementById('product-image')) document.getElementById('product-image').value = product.image || ''
    if(document.getElementById('product-brand')) document.getElementById('product-brand').value = product.brand || ''
    if(document.getElementById('product-features')) document.getElementById('product-features').value = product.features || ''
    if(document.getElementById('product-specifications')) document.getElementById('product-specifications').value = product.specifications || ''
    if(productImagePreview) {
      productImagePreview.src = product.image;
      productImagePreview.style.display = 'block';
    }
  } else {
    if(productImagePreview) productImagePreview.style.display = 'none';
  }

  // Show the modal
  modal.classList.remove('hidden')
  modal.style.display = 'flex'
}

function closeProductModal() {
  const modal = document.getElementById('product-modal')
  if (modal) {
    modal.classList.add('hidden')
    modal.style.display = 'none'
  }
}

window.openProductModal = openProductModal
window.closeProductModal = closeProductModal

// Attach all handler functions to window for inline onclick
window.editProduct = editProduct
window.deleteProduct = deleteProduct
window.openProductModal = openProductModal
window.closeProductModal = closeProductModal

// Image upload logic for product modal
const productImageFileInput = document.getElementById('product-image-file');
const productImageInput = document.getElementById('product-image');
const productImagePreview = document.getElementById('product-image-preview');

if (productImageFileInput) {
  productImageFileInput.addEventListener('change', async function () {
    const file = this.files[0];
    if (!file) return;
    // Show preview
    const reader = new FileReader();
    reader.onload = function (e) {
      productImagePreview.src = e.target.result;
      productImagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    // Upload to backend
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Image upload failed');
      const data = await response.json();
      // Assume backend returns { url: '...' }
      productImageInput.value = data.url || '';
    } catch (err) {
      showNotification('Image upload failed', 'error');
      productImageInput.value = '';
    }
  });
}

console.log("Admin inventory script fully loaded and ready")

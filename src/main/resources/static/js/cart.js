// Check if user is logged in before proceeding
if (!localStorage.getItem("currentUser")) {
  window.location.href = "login.html?redirect=products.html";
}
// Shopping cart functionality
document.addEventListener("DOMContentLoaded", () => {
  loadCart()
  initShippingForm()
})

async function fetchProductById(id) {
  try {
    const response = await fetch(`/api/products/${id}`)
    if (!response.ok) throw new Error('Failed to fetch product')
    return await response.json()
  } catch (err) {
    console.error('Error loading product:', err)
    return null
  }
}

// Update displayCartItems to use backend product info
async function displayCartItems(cart) {
  const cartItemsContainer = document.querySelector('.cart-items')
  cartItemsContainer.innerHTML = ''

  for (let i = 0; i < cart.length; i++) {
    const item = cart[i]
    const product = await fetchProductById(item.id)
    if (!product) continue
    const cartItem = document.createElement('div')
    cartItem.className = 'cart-item'
    cartItem.innerHTML = `
            <div class="item-image">
                <img src="${product.image || 'placeholders/default.jpg'}" alt="${product.name}">
            </div>
            <div class="item-details">
                <h3>${product.name}</h3>
                <p class="item-id">ID: ${product.id}</p>
            </div>
            <div class="item-price">₱${product.price.toFixed(2)}</div>
            <div class="item-quantity">
                <button class="quantity-btn" onclick="updateQuantity(${i}, 'decrease')">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${i}, 'set', this.value)">
                <button class="quantity-btn" onclick="updateQuantity(${i}, 'increase')">+</button>
            </div>
            <div class="item-total">₱${(product.price * item.quantity).toFixed(2)}</div>
            <div class="item-remove">
                <button class="remove-btn" onclick="removeItem(${i})">✕</button>
            </div>
        `
    cartItemsContainer.appendChild(cartItem)
  }
}

// Update loadCart to use async displayCartItems
async function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || []
  const cartWithItems = document.getElementById('cart-with-items')
  const emptyCart = document.getElementById('empty-cart')

  if (cart.length === 0) {
    cartWithItems.classList.add('hidden')
    emptyCart.classList.remove('hidden')
    return
  }

  cartWithItems.classList.remove('hidden')
  emptyCart.classList.add('hidden')

  await displayCartItems(cart)
  updateCartSummary(cart)
}

function updateCartSummary(cart) {
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const vat = subtotal * 0.12
  const shipping = 150 // Standard shipping
  const total = subtotal + vat + shipping

  document.getElementById("subtotal").textContent = `₱${subtotal.toFixed(2)}`
  document.getElementById("vat").textContent = `₱${vat.toFixed(2)}`
  document.getElementById("shipping").textContent = `₱${shipping.toFixed(2)}`
  document.getElementById("total").textContent = `₱${total.toFixed(2)}`
}

function initShippingForm() {
  const shippingMethod = document.getElementById("shipping-method")

  if (shippingMethod) {
    shippingMethod.addEventListener("change", () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || []
      updateCartSummary(cart)
    })
  }
}

// Global functions for cart operations
window.updateQuantity = (index, action, value) => {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const item = cart[index]
  let newQuantity = item.quantity

  if (action === "increase") {
    newQuantity += 1
  } else if (action === "decrease" && item.quantity > 1) {
    newQuantity -= 1
  } else if (action === "set") {
    newQuantity = Number.parseInt(value)
    if (newQuantity <= 0) return
  }

  // Update cart item in backend
  fetch(`/api/cart/update/${item.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      quantity: newQuantity
    })
  })
  .then(response => {
    if (response.ok) {
      cart[index].quantity = newQuantity
      localStorage.setItem("cart", JSON.stringify(cart))
      loadCart()
      updateCartCount()
    } else {
      showNotification("Failed to update cart", "error")
    }
  })
  .catch(error => {
    console.error('Error:', error)
    showNotification("An error occurred while updating cart", "error")
  })
}

window.removeItem = (index) => {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  cart.splice(index, 1)
  localStorage.setItem("cart", JSON.stringify(cart))
  loadCart()
  updateCartCount()
  showNotification("Item removed from cart")
}

// Declare updateCartCount and showNotification functions
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const cartCount = document.getElementById("cart-count")
  cartCount.textContent = cart.length
}

function showNotification(message) {
  alert(message)
}

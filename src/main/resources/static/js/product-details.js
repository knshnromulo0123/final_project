// Product details page functionality

document.addEventListener("DOMContentLoaded", () => {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search)
  const productId = Number.parseInt(urlParams.get("id"))

  if (!productId) {
    window.location.href = "products.html"
    return
  }

  loadProductDetails(productId)
  initTabs()
  initQuantityControls()
  initAddToCart(productId)
  initBuyNow(productId)
})

// Fetch product details from backend
async function fetchProductFromBackend(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`)
    if (!response.ok) throw new Error("Failed to fetch product")
    return await response.json()
  } catch (err) {
    console.error("Error loading product:", err)
    return null
  }
}

// Update loadProductDetails to use backend
async function loadProductDetails(productId) {
  const product = await fetchProductFromBackend(productId)
  if (!product) {
    window.location.href = "products.html"
    return
  }

  // Update page content
  document.getElementById("product-name").textContent = product.name
  document.getElementById("product-title").textContent = product.name
  document.getElementById("product-id").textContent = product.id
  document.getElementById("product-price").textContent = product.price.toFixed(2)
  document.getElementById("product-description").textContent = product.description
  document.getElementById("main-product-image").src = product.image || "placeholders/default.jpg"
  document.getElementById("main-product-image").alt = product.name

  // Update features
  const featuresList = document.getElementById("product-features")
  featuresList.innerHTML = ""
  if (product.features && Array.isArray(product.features)) {
    product.features.forEach((feature) => {
      const li = document.createElement("li")
      li.textContent = feature
      featuresList.appendChild(li)
    })
  }

  // Update specifications
  const specs = product.specifications || {}
  document.getElementById("product-brand").textContent = specs.brand || ""
  document.getElementById("product-material").textContent = specs.material || ""
  document.getElementById("product-weight").textContent = specs.weight || ""
  document.getElementById("product-dimensions").textContent = specs.dimensions || ""
  document.getElementById("product-warranty").textContent = specs.warranty || ""

  // Update availability
  const availability = document.querySelector(".product-availability span")
  if (product.stock > 0) {
    availability.textContent = "In Stock"
    availability.className = "in-stock"
  } else {
    availability.textContent = "Out of Stock"
    availability.className = "out-of-stock"
  }
}

function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabPanes = document.querySelectorAll(".tab-pane")

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab")

      // Update active button
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")

      // Update active pane
      tabPanes.forEach((pane) => pane.classList.remove("active"))
      document.getElementById(targetTab).classList.add("active")
    })
  })
}

function initQuantityControls() {
  const quantityInput = document.getElementById("quantity")

  window.incrementQuantity = () => {
    const currentValue = Number.parseInt(quantityInput.value)
    quantityInput.value = currentValue + 1
  }

  window.decrementQuantity = () => {
    const currentValue = Number.parseInt(quantityInput.value)
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1
    }
  }
}

function initAddToCart(productId) {
  const addToCartBtn = document.getElementById("add-to-cart-btn")

  addToCartBtn.addEventListener("click", () => {
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(product => {
        if (!product) return;
        if (product.stock === 0) {
          showNotification("Product is out of stock", "error");
          return;
        }
        const quantity = Number.parseInt(document.getElementById("quantity").value);
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = cart.find((item) => item.id === productId);
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
          });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        showNotification(`${product.name} added to cart!`);
        updateCartCount();
      });
  })
}

function initBuyNow(productId) {
  const buyNowBtn = document.getElementById("buy-now-btn")
  if (!buyNowBtn) return
  buyNowBtn.addEventListener("click", async () => {
    // Fetch product details
    const product = await fetchProductFromBackend(productId)
    if (!product || product.stock === 0) {
      showNotification("Product is out of stock", "error")
      return
    }
    const quantity = Number.parseInt(document.getElementById("quantity").value)
    // Store buy now item in sessionStorage
    const buyNowItem = [{
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    }]
    sessionStorage.setItem("buyNowItem", JSON.stringify(buyNowItem))
    // Redirect to checkout with buynow flag
    window.location.href = "checkout.html?buynow=1"
  })
}

// Declare showNotification and updateCartCount functions
function showNotification(message, type = "success") {
  // Simple notification implementation
  alert(message)
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const cartCount = document.getElementById("cart-count")
  cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0)
}

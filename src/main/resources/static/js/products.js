// Check if user is logged in before proceeding
if (!localStorage.getItem("currentUser")) {
  window.location.href = "login.html?redirect=products.html";
}

// Products page functionality

let products = [];
let currentPage = 1;
const PRODUCTS_PER_PAGE = 4;

// Fetch and display products

document.addEventListener("DOMContentLoaded", () => {
  // Initialize filters
  initFilters()

  // Initialize sorting
  initSorting()

  // Fetch and display products
  fetchProductsFromBackend().then(fetchedProducts => {
    products = fetchedProducts;
    renderPage(1, products);
  })
})

// Fetch products from backend instead of using hardcoded data
async function fetchProductsFromBackend() {
  try {
    const response = await fetch('/api/products')
    if (!response.ok) throw new Error('Failed to fetch products')
    return await response.json()
  } catch (err) {
    console.error('Error loading products:', err)
    return []
  }
}

function renderPage(page, productsToShow) {
  currentPage = page;
  const totalPages = Math.ceil(productsToShow.length / PRODUCTS_PER_PAGE);
  const startIdx = (page - 1) * PRODUCTS_PER_PAGE;
  const endIdx = startIdx + PRODUCTS_PER_PAGE;
  const paginatedProducts = productsToShow.slice(startIdx, endIdx);
  displayProducts(paginatedProducts);
  renderPagination(totalPages, page, productsToShow);
}

function renderPagination(totalPages, current, productsToShow) {
  const paginationDiv = document.querySelector('.pagination');
  if (!paginationDiv) return;
  paginationDiv.innerHTML = '';
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn' + (i === current ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => renderPage(i, productsToShow));
    paginationDiv.appendChild(btn);
  }
  // Next button
  if (current < totalPages) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Next';
    nextBtn.addEventListener('click', () => renderPage(current + 1, productsToShow));
    paginationDiv.appendChild(nextBtn);
  }
}

function initFilters() {
  const categoryFilters = document.querySelectorAll('input[type="checkbox"]')
  const priceRange = document.getElementById("price-range")
  const minPrice = document.getElementById("min-price")
  const maxPrice = document.getElementById("max-price")
  const applyFiltersBtn = document.querySelector(".filters .btn")

  // Category filters
  categoryFilters.forEach((filter) => {
    filter.addEventListener("change", applyFilters)
  })

  // Price range
  if (priceRange) {
    priceRange.addEventListener("input", function () {
      maxPrice.value = this.value
    })
  }

  // Apply filters button
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", applyFilters)
  }
}

function initSorting() {
  const sortSelect = document.getElementById("sort-by")

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      const sortedProducts = sortProducts(products, this.value)
      renderPage(1, sortedProducts)
    })
  }
}

function applyFilters() {
  let filteredProducts = [...products]

  // Category filters
  const selectedCategories = []
  const categoryFilters = document.querySelectorAll('input[id^="category-"]:checked')
  categoryFilters.forEach((filter) => {
    selectedCategories.push(filter.id.replace("category-", ""))
  })

  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter((product) => selectedCategories.includes(product.category))
  }

  // Price filter
  const minPrice = Number.parseFloat(document.getElementById("min-price").value) || 0
  const maxPrice = Number.parseFloat(document.getElementById("max-price").value) || 5000

  filteredProducts = filteredProducts.filter((product) => product.price >= minPrice && product.price <= maxPrice)

  renderPage(1, filteredProducts)
}

function sortProducts(products, sortBy) {
  const sorted = [...products]

  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price)
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price)
    case "newest":
      return sorted.sort((a, b) => b.id - a.id)
    default:
      return sorted
  }
}

function displayProducts(productsToShow) {
  const productGrid = document.querySelector(".product-grid")
  if (!productGrid) return
  productGrid.innerHTML = ""
  productsToShow.forEach((product) => {
    const productCard = document.createElement("div")
    productCard.className = "product-card"
    productCard.setAttribute("data-id", product.id)
    productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">₱${product.price.toFixed(2)}</p>
            <a href="product-details.html?id=${product.id}" class="btn">View Details</a>
        `
    productGrid.appendChild(productCard)
  })
}

// Admin customers management functionality

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing customers page...");
  // Check admin authentication
  if (!checkAdminAuth()) {
    console.log("Not authenticated, redirecting...");
    window.location.href = "../index.html";
    return;
  }
  loadCustomers();
  initCustomerFilters();
});

function checkAdminAuth() {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  console.log("Admin logged in:", isLoggedIn);
  return isLoggedIn;
}

let currentPage = 1;
const rowsPerPage = 5;
let paginatedUsers = [];

async function loadCustomers() {
  try {
    const res = await fetch('/api/customers', { credentials: 'include' });
    if (!res.ok) {
      showNotification('Error loading customers', 'error');
      return;
    }
    const users = await res.json();
    // Save users to localStorage for modal access
    localStorage.setItem("users", JSON.stringify(users));
    displayCustomers(users, 1); // Always start at page 1
  } catch (err) {
    showNotification('Error loading customers', 'error');
  }
}

function displayCustomers(users, page = 1) {
  const customerTableBody = document.getElementById("customer-table-body");
  if (!customerTableBody) return;
  customerTableBody.innerHTML = "";

  // Pagination logic
  paginatedUsers = users;
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const usersToShow = users.slice(start, end);

  usersToShow.forEach((user, index) => {
    const row = document.createElement("tr");
    // Use user.fullName or user.firstName + user.lastName if available, fallback to user.name
    let displayName = user.fullName || ((user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : user.name || "N/A");
    // Calculate total orders: count only completed orders if available, else all orders
    let totalOrders = 0;
    if (user.orders && Array.isArray(user.orders)) {
      totalOrders = user.orders.filter(order => order.status === 'completed' || order.status === 'COMPLETED' || !order.status).length;
    }
    const totalSpent = user.orders ? user.orders.reduce((total, order) => total + (order.total || 0), 0) : 0;
    // Use user.blocked boolean for status
    let status = user.blocked ? "Blocked" : "Active";
    row.innerHTML = `
      <td>#C${String(start + index + 1).padStart(3, "0")}</td>
      <td>${displayName}</td>
      <td>${user.email}</td>
      <td>${user.phone || "N/A"}</td>
      <td>${totalOrders}</td>
      <td>₱${totalSpent.toFixed(2)}</td>
      <td><span class="status ${status.toLowerCase()}">${status}</span></td>
      <td>
        <button class="btn btn-small" onclick="viewCustomer(${user.id})">View</button>
        <button class="btn btn-small btn-danger" onclick="deleteCustomer(${user.id})">Delete</button>
        ${user.blocked
          ? `<button class="btn btn-small btn-success" onclick="unblockCustomer(${user.id})">Unblock</button>`
          : `<button class="btn btn-small btn-danger" onclick="blockCustomer(${user.id})">Block</button>`}
      </td>
    `;
    customerTableBody.appendChild(row);
  });
  renderPagination(users.length, page);
}

function renderPagination(totalRows, currentPage) {
  const paginationContainer = document.getElementById("pagination-container");
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  if (totalPages <= 1) return;

  // Prev button
  const prevBtn = document.createElement("button");
  prevBtn.className = "pagination-btn";
  prevBtn.textContent = "Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) displayCustomers(paginatedUsers, currentPage - 1);
  };
  paginationContainer.appendChild(prevBtn);

  // Page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = `pagination-btn${i === currentPage ? " active" : ""}`;
    btn.textContent = i;
    btn.onclick = () => {
      displayCustomers(paginatedUsers, i);
    };
    paginationContainer.appendChild(btn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.className = "pagination-btn";
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) displayCustomers(paginatedUsers, currentPage + 1);
  };
  paginationContainer.appendChild(nextBtn);
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Global functions for customer management
window.viewCustomer = (userId) => {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find((u) => u.id === userId);

  if (user) {
    openCustomerModal(user);
  }
}

window.blockCustomer = async (userId) => {
  if (confirm("Are you sure you want to block this customer?")) {
    try {
      const res = await fetch(`/api/customers/${userId}/block`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        showNotification("Customer blocked successfully!");
        loadCustomers();
      } else {
        showNotification("Failed to block customer.", 'error');
      }
    } catch (err) {
      showNotification("Failed to block customer.", 'error');
    }
  }
};

window.unblockCustomer = async (userId) => {
  try {
    const res = await fetch(`/api/customers/${userId}/unblock`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (res.ok) {
      showNotification("Customer unblocked successfully!");
      loadCustomers();
    } else {
      showNotification("Failed to unblock customer.", 'error');
    }
  } catch (err) {
    showNotification("Failed to unblock customer.", 'error');
  }
}

window.deleteCustomer = async (userId) => {
  if (confirm("Are you sure you want to permanently delete this customer? This action cannot be undone.")) {
    try {
      const res = await fetch(`/api/customers/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.status === 204) {
        showNotification("Customer deleted successfully!");
        loadCustomers();
      } else if (res.status === 403) {
        showNotification("You do not have permission to delete this customer.", 'error');
      } else if (res.status === 404) {
        showNotification("Customer not found.", 'error');
      } else {
        showNotification("Failed to delete customer.", 'error');
      }
    } catch (err) {
      showNotification("Failed to delete customer.", 'error');
    }
  }
};

function openCustomerModal(user) {
  const modal = document.getElementById("customer-modal");
  if (!modal) return;

  // Update modal content
  const displayName = user.fullName || ((user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : user.name || "N/A");
  document.getElementById("customer-name").textContent = displayName;
  document.getElementById("customer-email").textContent = user.email;
  document.getElementById("customer-phone").textContent = user.phone || "N/A";
  // Only update registration and status if present in modal
  const regElem = document.getElementById("customer-registration");
  if (regElem) regElem.textContent = formatDate(user.registrationDate);
  const statusElem = document.getElementById("customer-status");
  if (statusElem) statusElem.textContent = user.blocked ? "Blocked" : "Active";

  // Display orders
  const ordersList = document.getElementById("customer-orders-list");
  if (ordersList) {
    ordersList.innerHTML = "";
    if (user.orders && user.orders.length > 0) {
      user.orders.forEach((order, idx) => {
        const orderDiv = document.createElement("div");
        orderDiv.className = "order-item";
        let itemsHtml = "";
        if (order.items && order.items.length > 0) {
          itemsHtml = order.items.map(item => {
            const subtotal = (item.price || 0) * (item.quantity || 1);
            const tax = subtotal * 0.12;
            // Use order.shippingMethod or fallback to 'standard'
            const shipping = (order.shippingMethod === 'express') ? 300 : 150;
            const total = subtotal + tax + shipping;
            return `
              <div class="order-product">
                <strong>${item.name || item.title || "Item"}</strong><br>
                Quantity: ${item.quantity || 1}<br>
                Subtotal: ₱${subtotal.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}<br>
                VAT (12%): ₱${tax.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}<br>
                Shipping: ₱${shipping.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}<br>
                <strong>Total: ₱${total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</strong>
              </div>
            `;
          }).join("");
        } else {
          itemsHtml = "<div>No items found.</div>";
        }
        let shippingHtml = '';
        // Prefer structured shipping fields if present
        if (order.shippingStreet || order.shippingCity || order.shippingProvince || order.shippingZipCode || order.shippingCountry || order.shippingMethod) {
          shippingHtml = `
            <div class="order-shipping">
              <strong>Shipping Information</strong><br>
              Street: ${order.shippingStreet || "N/A"}<br>
              City: ${order.shippingCity || "N/A"}<br>
              Province: ${order.shippingProvince || "N/A"}<br>
              Zip Code: ${order.shippingZipCode || "N/A"}<br>
              Country: ${order.shippingCountry || "N/A"}<br>
              Method: ${order.shippingMethod || "N/A"}
            </div>
          `;
        } else if (order.shipping) {
          // Fallback for legacy shipping object
          shippingHtml = `
            <div class="order-shipping">
              <strong>Shipping Information</strong><br>
              Address: ${order.shipping.address || "N/A"}<br>
              City: ${order.shipping.city || "N/A"}<br>
              Province: ${order.shipping.province || "N/A"}<br>
              Shipping Method: ${order.shipping.method || "N/A"}
            </div>
          `;
        }
        orderDiv.innerHTML = `
          <div><strong>Order #${order.id || idx + 1}</strong>${order.date ? ` - ${formatDate(order.date)}` : ""}</div>
          ${itemsHtml}
          ${shippingHtml}
          <div>Status: 
            <select class="order-status-select" data-order-id="${order.orderId}">
              <option value="processing" ${order.status === "processing" ? "selected" : ""}>Processing</option>
              <option value="shipping" ${order.status === "shipping" ? "selected" : ""}>Shipping</option>
              <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Delivered</option>
            </select>
          </div>
          <hr>
        `;
        ordersList.appendChild(orderDiv);
      });
      // Add event listeners for status change
      ordersList.querySelectorAll('.order-status-select').forEach(select => {
        select.addEventListener('change', async function() {
          const orderId = this.getAttribute('data-order-id');
          const newStatus = this.value;
          // Call backend to update order status
          try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus }),
              credentials: 'include' // Ensure cookies/session are sent
            });
            if (!response.ok) {
              showNotification('Failed to update order status', 'error');
              return;
            }
            showNotification('Order status updated!', 'success');
            loadCustomers(); // Refresh table
          } catch (err) {
            showNotification('Failed to update order status', 'error');
          }
        });
      });
    } else {
      ordersList.innerHTML = "<p>No orders found.</p>";
    }
  }
  modal.classList.remove("hidden");
}

window.closeCustomerModal = () => {
  const modal = document.getElementById("customer-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// Define showNotification function
function showNotification(message, type = "success") {
  alert(message);
}

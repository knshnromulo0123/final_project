// Checkout page functionality
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isBuyNow = urlParams.get("buynow") === "1";
    loadOrderSummary(isBuyNow);
    initPaymentMethods();
    initShippingMethods();
    initCheckoutForm(isBuyNow);
    loadUserInfo();
});

function loadUserInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        // Pre-fill user information if available
        document.getElementById('firstName').value = currentUser.firstName || '';
        document.getElementById('lastName').value = currentUser.lastName || '';
        document.getElementById('email').value = currentUser.email || '';
    }
}

function loadOrderSummary(isBuyNow = false) {
    let cart;
    if (isBuyNow) {
        cart = JSON.parse(sessionStorage.getItem("buyNowItem")) || [];
    } else {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
    }
    if (cart.length === 0) {
        window.location.href = isBuyNow ? "products.html" : "cart.html";
        return;
    }
    displayOrderItems(cart);
    updateOrderTotals(cart);
}

function displayOrderItems(cart) {
    const summaryItems = document.querySelector(".summary-items");
    summaryItems.innerHTML = "";

    cart.forEach((item) => {
        const summaryItem = document.createElement("div");
        summaryItem.className = "summary-item";
        summaryItem.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
                <span class="item-quantity">${item.quantity}</span>
            </div>
            <div class="item-details">
                <h4>${item.name}</h4>
                <p class="item-price">₱${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        `;
        summaryItems.appendChild(summaryItem);
    });
}

function updateOrderTotals(cart) {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const vat = subtotal * 0.12;
    const shippingCost = getShippingCost();
    const total = subtotal + vat + shippingCost;

    document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('vat').textContent = `₱${vat.toFixed(2)}`;
    document.getElementById('shipping-cost').textContent = `₱${shippingCost.toFixed(2)}`;
    document.getElementById('total-cost').textContent = `₱${total.toFixed(2)}`;
}

function getShippingCost() {
    const selectedShipping = document.querySelector('input[name="shipping"]:checked');
    return selectedShipping && selectedShipping.value === "express" ? 300 : 150;
}

function initPaymentMethods() {
    // No initialization needed for COD only
    return;
}

function initShippingMethods() {
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    shippingOptions.forEach((option) => {
        option.addEventListener("change", () => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            updateOrderTotals(cart);
        });
    });
}

function initCheckoutForm(isBuyNow = false) {
    const checkoutForm = document.getElementById("checkout-form");
    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (validateCheckoutForm()) {
            await processOrder(isBuyNow);
        }
    });
}

function validateCheckoutForm() {
    const requiredFields = [
        "firstName",
        "lastName",
        "email", 
        "phone",
        "address",
        "city",
        "province",
        "postal-code"
    ];

    let isValid = true;

    // Validate required fields
    requiredFields.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            if (field) {
                field.style.borderColor = "#dc3545";
            }
            isValid = false;
        } else {
            field.style.borderColor = "#ddd";
        }
    });

    // Validate shipping method
    const shippingMethod = document.querySelector('input[name="shipping"]:checked');
    if (!shippingMethod) {
        isValid = false;
        document.querySelector('.shipping-options').style.borderColor = "#dc3545";
    } else {
        document.querySelector('.shipping-options').style.borderColor = "#ddd";
    }

    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
    }

    return isValid;
}

async function processOrder(isBuyNow = false) {
    try {
        let cart;
        if (isBuyNow) {
            cart = JSON.parse(sessionStorage.getItem("buyNowItem")) || [];
        } else {
            cart = JSON.parse(localStorage.getItem("cart")) || [];
        }
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser || !currentUser.id) {
            window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.href);
            return;
        }
        const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        const vat = subtotal * 0.12;
        const shippingCost = getShippingCost();
        const total = subtotal + vat + shippingCost;
        const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
        const addressRaw = document.getElementById('address').value;
        const cityField = document.getElementById('city').value;
        const provinceField = document.getElementById('province').value;
        const zipField = document.getElementById('postal-code').value;
        let shippingStreet = null, shippingCity = null, shippingProvince = null, shippingZipCode = null, shippingCountry = null;
        if (addressRaw) {
            const parts = addressRaw.split(',').map(p => p.trim());
            shippingStreet = parts[0] || null;
            shippingCity = parts[1] || cityField || null;
            shippingProvince = parts[2] || provinceField || null;
            shippingZipCode = parts[3] || zipField || null;
            shippingCountry = parts[4] || 'Philippines';
        } else {
            shippingStreet = null;
            shippingCity = cityField || null;
            shippingProvince = provinceField || null;
            shippingZipCode = zipField || null;
            shippingCountry = 'Philippines';
        }
        const orderData = {
            orderId: generateOrderId(),
            customerId: currentUser.id,
            orderDate: new Date().toISOString(),
            status: "PENDING",
            total: total,
            subtotal: subtotal,
            vat: vat,
            shippingCost: shippingCost,
            items: cart.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                image: item.image
            })),
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            shippingAddress: addressRaw,
            city: document.getElementById('city').value,
            state: document.getElementById('province').value,
            zip: document.getElementById('postal-code').value,
            country: 'Philippines',
            shippingMethod: shippingMethod,
            paymentMethod: 'COD',
            shippingStreet: shippingStreet,
            shippingCity: shippingCity,
            shippingProvince: shippingProvince,
            shippingZipCode: shippingZipCode,
            shippingCountry: shippingCountry
        };
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));
        // Clear only the relevant storage
        if (isBuyNow) {
            sessionStorage.removeItem("buyNowItem");
        } else {
            localStorage.setItem("cart", JSON.stringify([]));
        }
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(orderData)
        });
        if (!response.ok) {
            // Restore cart or buyNowItem if server fails
            if (isBuyNow) {
                sessionStorage.setItem("buyNowItem", JSON.stringify(cart));
            } else {
                localStorage.setItem("cart", JSON.stringify(cart));
            }
            const errorData = await response.text();
            throw new Error(errorData || 'Failed to create order');
        }
        showNotification('Order placed successfully!');
        window.location.href = `order-confirmation.html?orderId=${orderData.orderId}`;
    } catch (error) {
        console.error('Error processing order:', error);
        showNotification(error.message, 'error');
    }
}

function generateOrderId() {
    return 'ORD' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();
}

// Notification and CSS animation code remains unchanged
function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  // Add notification styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 2rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    ${type === "error" ? "background: #dc3545;" : "background: #28a745;"}
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// Add CSS animations for notifications
const style = document.createElement("style")
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)

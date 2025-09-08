// Order confirmation page functionality

document.addEventListener("DOMContentLoaded", () => {
  loadOrderConfirmation()
})

function loadOrderConfirmation() {
    // Get order ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (!orderId) {
        window.location.href = "index.html";
        return;
    }

    // Get current user and find their order
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = "login.html?redirect=" + encodeURIComponent(window.location.href);
        return;
    }

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.orderId === orderId);
    if (!order) {
        window.location.href = "index.html";
        return;
    }

    updateOrderDetails(order);
}

function updateOrderDetails(order) {
    // Update order number
    document.getElementById('order-number').textContent = order.orderId;

    // Update order date
    const orderDate = new Date(order.orderDate);
    document.getElementById('order-date').textContent = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Calculate and update estimated delivery (3-5 days from order date)
    const deliveryDate = new Date(orderDate);
    const deliveryStart = new Date(deliveryDate.setDate(deliveryDate.getDate() + 3));
    const deliveryEnd = new Date(orderDate.setDate(deliveryDate.getDate() + 2));
    
    document.getElementById('delivery-date').textContent = `${deliveryStart.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
    })} - ${deliveryEnd.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })}`;

    // Update total amount
    document.getElementById('total-amount').textContent = `₱${order.total.toFixed(2)}`;
}

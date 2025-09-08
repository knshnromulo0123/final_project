document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        return;
    }

    // Update user name in header
    const userBtn = document.querySelector('.user-actions a');
    if (userBtn) {
        userBtn.textContent = currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`;
        userBtn.href = 'profile.html';
    }

    // Only initialize filters if they exist
    if (document.getElementById('order-search') || document.getElementById('status-filter') || document.getElementById('date-filter')) {
        initFilters();
    }
    loadOrders();
});

function initFilters() {
    const searchInput = document.getElementById('order-search');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');

    // Add event listeners to filters if they exist
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);
}

async function loadOrders() {    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        return;
    }

    // Fetch orders from backend for this user (use detailed DTO endpoint)
    let userOrders = [];
    try {
        const res = await fetch(`/api/orders/customer/${currentUser.id}`, { credentials: 'include' });
        if (res.ok) {
            userOrders = await res.json();
        }
    } catch (e) {
        // fallback to localStorage if backend fails
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        userOrders = orders.filter(order => order.customerId === currentUser.id);
    }
    if (!userOrders || userOrders.length === 0) {
        showNoOrders();
        return;
    }
    displayOrders(userOrders);
}

function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    const noOrders = document.getElementById('no-orders');

    if (!orders || orders.length === 0) {
        ordersList.classList.add('hidden');
        noOrders.classList.remove('hidden');
        return;
    }

    ordersList.classList.remove('hidden');
    noOrders.classList.add('hidden');
    ordersList.innerHTML = '';

    orders.forEach(order => {
        const orderElement = createOrderElement(order);
        ordersList.appendChild(orderElement);
    });
}

function createOrderElement(order) {
    const orderDiv = document.createElement('div');
    orderDiv.className = 'order-item';

    // Format the date
    const orderDate = new Date(order.orderDate);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Calculate total items
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    orderDiv.innerHTML = `
        <div class="order-header">
            <div class="order-id">Order #${order.orderId}</div>
            <div class="order-date">${formattedDate}</div>
            <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
            <div class="order-total">₱${typeof order.total === 'number' ? order.total.toFixed(2) : order.total ? order.total : ''}</div>
        </div>
        <div class="order-details">
            ${order.items.map(item => `
                <div class="order-product">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="product-info">
                        <h4>${item.name}</h4>
                        <p>Quantity: ${item.quantity}</p>
                        <p>₱${typeof item.price === 'number' ? (item.price * item.quantity).toFixed(2) : item.price}</p>
                    </div>
                </div>
            `).join('')}
            <div class="shipping-info">
                <h4>Shipping Information</h4>
                <p><strong>Address:</strong> ${order.address}</p>
                <p><strong>City:</strong> ${order.city}</p>
                <p><strong>Province:</strong> ${order.state}</p>
                <p><strong>Shipping Method:</strong> ${order.shippingMethod === 'standard' ? 'Standard Delivery' : 'Express Delivery'}</p>
            </div>
        </div>
    `;

    return orderDiv;
}

function applyFilters() {
    const searchTerm = document.getElementById('order-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === currentUser.id);

    if (!user || !user.orders) {
        showNoOrders();
        return;
    }

    let filteredOrders = [...user.orders];

    // Apply search filter
    if (searchTerm) {
        filteredOrders = filteredOrders.filter(order =>
            order.items.some(item =>
                item.name.toLowerCase().includes(searchTerm)
            ) ||
            order.id.toString().includes(searchTerm)
        );
    }

    // Apply status filter
    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order =>
            order.status.toLowerCase() === statusFilter
        );
    }

    // Apply date filter
    if (dateFilter) {
        const now = new Date();
        const monthsAgo = new Date();
        
        switch(dateFilter) {
            case 'last-month':
                monthsAgo.setMonth(now.getMonth() - 1);
                break;
            case 'last-3-months':
                monthsAgo.setMonth(now.getMonth() - 3);
                break;
            case 'last-6-months':
                monthsAgo.setMonth(now.getMonth() - 6);
                break;
            case 'last-year':
                monthsAgo.setFullYear(now.getFullYear() - 1);
                break;
        }

        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= monthsAgo && orderDate <= now;
        });
    }

    displayOrders(filteredOrders);
}

function showNoOrders() {
    const ordersList = document.getElementById('orders-list');
    const noOrders = document.getElementById('no-orders');

    ordersList.classList.add('hidden');
    noOrders.classList.remove('hidden');
    noOrders.innerHTML = `
        <h3>No Orders Yet</h3>
        <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
        <a href="products.html" class="btn">Browse Products</a>
    `;
}

// Add CSS animations if not already present
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

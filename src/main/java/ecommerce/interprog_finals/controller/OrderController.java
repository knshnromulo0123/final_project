package ecommerce.interprog_finals.controller;

import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import ecommerce.interprog_finals.entity.*;
import ecommerce.interprog_finals.repository.*;
import ecommerce.interprog_finals.service.OrderService;
import ecommerce.interprog_finals.dto.OrderDetailsDTO;
import ecommerce.interprog_finals.dto.OrderItemDTO;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CheckoutInformationRepository checkoutInformationRepository;

    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    // Endpoint to create an order (checkout)
    @PostMapping
    public ResponseEntity<String> processCheckout(@RequestBody Map<String, Object> orderData, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("Unauthenticated user attempted to create an order");
            return ResponseEntity.status(401).body("Not authenticated");
        }

        // Get authenticated user
        String email = authentication.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            logger.error("Customer not found for email: {}", email);
            return ResponseEntity.status(404).body("Customer not found");
        }

        // Verify the authenticated user matches the customer ID
        Long customerId;
        try {
            customerId = Long.parseLong(orderData.get("customerId").toString());
            if (!customer.getId().equals(customerId)) {
                logger.error("User {} attempted to create order for different customer {}", customer.getId(), customerId);
                return ResponseEntity.status(403).body("Unauthorized to create order for this customer");
            }
        } catch (NumberFormatException | NullPointerException e) {
            logger.error("Invalid or missing customerId in order data", e);
            return ResponseEntity.badRequest().body("Invalid or missing customerId in order data");
        }

        try {
            // Extract shipping address (try both keys for compatibility)
            String shippingAddress = orderData.get("shippingAddress") != null
                    ? orderData.get("shippingAddress").toString()
                    : (orderData.get("address") != null ? orderData.get("address").toString() : null);
            if (shippingAddress == null) {
                return ResponseEntity.badRequest().body("Missing shipping address");
            }

            // Create CheckoutInformation
            CheckoutInformation checkoutInformation = new CheckoutInformation();
            checkoutInformation.setOrderId(orderData.get("orderId") != null ? orderData.get("orderId").toString() : UUID.randomUUID().toString());
            checkoutInformation.setCustomerId(customerId);
            checkoutInformation.setShippingAddress(shippingAddress);
            checkoutInformation.setCity(orderData.get("city") != null ? orderData.get("city").toString() : null);
            checkoutInformation.setState(orderData.get("state") != null ? orderData.get("state").toString() : null);
            checkoutInformation.setZip(orderData.get("zip") != null ? orderData.get("zip").toString() : null);
            checkoutInformation.setCountry(orderData.get("country") != null ? orderData.get("country").toString() : null);
            checkoutInformation.setShippingMethod(orderData.get("shippingMethod") != null ? orderData.get("shippingMethod").toString() : null);
            checkoutInformation.setPaymentMethod(orderData.get("paymentMethod") != null ? orderData.get("paymentMethod").toString() : null);
            checkoutInformation.setTermsAccepted(true);

            // Set customer info fields from orderData
            checkoutInformation.setFirstName(orderData.get("firstName") != null ? orderData.get("firstName").toString() : null);
            checkoutInformation.setLastName(orderData.get("lastName") != null ? orderData.get("lastName").toString() : null);
            checkoutInformation.setEmail(orderData.get("email") != null ? orderData.get("email").toString() : null);
            checkoutInformation.setPhone(orderData.get("phone") != null ? orderData.get("phone").toString() : null);

            // Create Order
            Order order = new Order();
            order.setCustomer(customer);

            // Use .doubleValue() to convert directly from Double to double
            Object totalValue = orderData.get("total");
            if (totalValue instanceof Double) {
                order.setTotal(((Double) totalValue).doubleValue());
            } else if (totalValue instanceof Integer) {
                order.setTotal(((Integer) totalValue).doubleValue());
            } else if (totalValue instanceof String) {
                try {
                    order.setTotal(Double.parseDouble((String) totalValue));
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("Invalid total format: " + totalValue, e);
                }
            } else {
                throw new IllegalArgumentException("Unexpected total type: " + (totalValue != null ? totalValue.getClass().getName() : "null"));
            }

            // Set structured shipping info fields if present
            order.setShippingStreet(orderData.get("shippingStreet") != null ? orderData.get("shippingStreet").toString() : null);
            order.setShippingCity(orderData.get("shippingCity") != null ? orderData.get("shippingCity").toString() : null);
            order.setShippingProvince(orderData.get("shippingProvince") != null ? orderData.get("shippingProvince").toString() : null);
            order.setShippingZipCode(orderData.get("shippingZipCode") != null ? orderData.get("shippingZipCode").toString() : null);
            order.setShippingCountry(orderData.get("shippingCountry") != null ? orderData.get("shippingCountry").toString() : null);
            order.setShippingMethod(orderData.get("shippingMethod") != null ? orderData.get("shippingMethod").toString() : null);
            order.setStatus("Processing");
            order.setOrderDate(new java.util.Date());            // Save order and checkout info
            String orderId = orderService.createOrder(order, checkoutInformation, customerId);
            Order savedOrder = orderRepository.findByOrderId(orderId);
            
            // Process order items
            List<Map<String, Object>> items = null;
            Object itemsObj = orderData.get("items");
            Object productsObj = orderData.get("products");
            
            if (itemsObj instanceof List<?>) {
                List<?> itemsList = (List<?>) itemsObj;
                if (!itemsList.isEmpty() && itemsList.get(0) instanceof Map) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> checkedItems = (List<Map<String, Object>>) itemsList;
                    items = checkedItems;
                }
            } else if (productsObj instanceof List<?>) {
                List<?> productsList = (List<?>) productsObj;
                if (!productsList.isEmpty() && productsList.get(0) instanceof Map) {                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> checkedProducts = (List<Map<String, Object>>) productsList;
                    items = checkedProducts;
                }
            }

            if (items != null) {
                for (Map<String, Object> item : items) {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(savedOrder);
                    // Handle product details
                    Long productId = null;
                    if (item.get("id") != null) {
                        try {
                            productId = Long.parseLong(item.get("id").toString());
                        } catch (Exception e) {
                            logger.warn("Invalid product ID: {}", item.get("id"));
                        }
                    }
                    // Try to get product details from database first
                    if (productId != null) {
                        Optional<Product> product = productRepository.findById(productId);
                        if (product.isPresent()) {
                            Product p = product.get();
                            orderItem.setProductId(productId);
                            orderItem.setName(p.getName());
                            orderItem.setImage(p.getImage());
                            orderItem.setPrice(p.getPrice());
                            // --- INVENTORY UPDATE LOGIC ---
                            int quantity = 1;
                            if (item.get("quantity") != null) {
                                try {
                                    if (item.get("quantity") instanceof Number) {
                                        quantity = ((Number) item.get("quantity")).intValue();
                                    } else {
                                        quantity = Integer.parseInt(item.get("quantity").toString());
                                    }
                                } catch (Exception e) {
                                    logger.warn("Invalid quantity: {}, using default of 1", item.get("quantity"));
                                }
                            }
                            // Decrement stock
                            int newStock = p.getStock() - quantity;
                            if (newStock < 0) newStock = 0; // Prevent negative stock
                            p.setStock(newStock);
                            productRepository.save(p);
                            orderItem.setQuantity(quantity);
                            // --- END INVENTORY UPDATE LOGIC ---
                        } else {
                            setOrderItemFromCartData(orderItem, item);
                            // Set quantity as before
                            int quantity = 1;
                            if (item.get("quantity") != null) {
                                try {
                                    if (item.get("quantity") instanceof Number) {
                                        quantity = ((Number) item.get("quantity")).intValue();
                                    } else {
                                        quantity = Integer.parseInt(item.get("quantity").toString());
                                    }
                                } catch (Exception e) {
                                    logger.warn("Invalid quantity: {}, using default of 1", item.get("quantity"));
                                }
                            }
                            orderItem.setQuantity(quantity);
                        }
                    } else {
                        setOrderItemFromCartData(orderItem, item);
                        // Set quantity as before
                        int quantity = 1;
                        if (item.get("quantity") != null) {
                            try {
                                if (item.get("quantity") instanceof Number) {
                                    quantity = ((Number) item.get("quantity")).intValue();
                                } else {
                                    quantity = Integer.parseInt(item.get("quantity").toString());
                                }
                            } catch (Exception e) {
                                logger.warn("Invalid quantity: {}, using default of 1", item.get("quantity"));
                            }
                        }
                        orderItem.setQuantity(quantity);
                    }
                    if (orderItem.getName() == null || orderItem.getPrice() == 0) {
                        logger.warn("OrderItem missing product details: {}", item);
                    }
                    orderItemRepository.save(orderItem);
                }
            }

            return ResponseEntity.ok("Order created successfully with orderId: " + orderId);

        } catch (Exception e) {
            logger.error("Error processing checkout", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                   .body("Error processing checkout: " + e.getMessage());
        }
    }

    private void setOrderItemFromCartData(OrderItem orderItem, Map<String, Object> item) {
        // Set product ID if available
        if (item.get("id") != null) {
            try {
                orderItem.setProductId(Long.parseLong(item.get("id").toString()));
            } catch (Exception e) {
                logger.warn("Invalid product ID in cart data: {}", item.get("id"));
            }
        }

        // Set name
        orderItem.setName(item.get("name") != null ? item.get("name").toString() : null);
        
        // Set image
        orderItem.setImage(item.get("image") != null ? item.get("image").toString() : null);
        
        // Set price
        if (item.get("price") instanceof Number) {
            orderItem.setPrice(((Number) item.get("price")).doubleValue());
        } else if (item.get("price") != null) {
            try {
                orderItem.setPrice(Double.parseDouble(item.get("price").toString()));
            } catch (Exception e) {
                logger.warn("Invalid price in cart data: {}", item.get("price"));
            }
        }
    }

    // Get order details by orderId
    @GetMapping("/checkout/{orderId}")
    public ResponseEntity<OrderDetailsDTO> getCheckoutInformationByOrderId(@PathVariable String orderId, Authentication authentication) {
        // Check authentication
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("Unauthenticated user attempted to access order information");
            return ResponseEntity.status(401).body(null);
        }

        // Get authenticated user
        String email = authentication.getName();
        Customer authenticatedCustomer = customerRepository.findByEmail(email);
        if (authenticatedCustomer == null) {
            logger.error("Customer not found for email: {}", email);
            return ResponseEntity.status(404).body(null);
        }

        // Get checkout and order information
        CheckoutInformation checkoutInformation = checkoutInformationRepository.findByOrderId(orderId);
        if (checkoutInformation == null) {
            return ResponseEntity.notFound().build();
        }

        Order order = orderRepository.findByOrderId(orderId);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        // Verify the authenticated user owns this order
        if (!order.getCustomer().getId().equals(authenticatedCustomer.getId())) {
            logger.error("User {} attempted to access order belonging to different customer {}", 
                authenticatedCustomer.getId(), order.getCustomer().getId());
            return ResponseEntity.status(403).body(null);
        }

        OrderDetailsDTO orderDetailsDTO = new OrderDetailsDTO();
        orderDetailsDTO.setOrderId(checkoutInformation.getOrderId());
        orderDetailsDTO.setOrderDate(order.getOrderDate() != null ? order.getOrderDate().toString() : null);
        orderDetailsDTO.setStatus(order.getStatus());
        orderDetailsDTO.setShippingMethod(checkoutInformation.getShippingMethod());
        orderDetailsDTO.setPaymentMethod(checkoutInformation.getPaymentMethod());
        orderDetailsDTO.setAddress(checkoutInformation.getShippingAddress());
        orderDetailsDTO.setCity(checkoutInformation.getCity());
        orderDetailsDTO.setState(checkoutInformation.getState());
        orderDetailsDTO.setZip(checkoutInformation.getZip());
        orderDetailsDTO.setCountry(checkoutInformation.getCountry());
        orderDetailsDTO.setFirstName(checkoutInformation.getFirstName());
        orderDetailsDTO.setLastName(checkoutInformation.getLastName());
        orderDetailsDTO.setEmail(checkoutInformation.getEmail());
        orderDetailsDTO.setPhone(checkoutInformation.getPhone());

        // Fetch order items and map to DTOs
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        List<OrderItemDTO> itemDTOs = new ArrayList<>();
        double subtotal = 0.0;
        for (OrderItem item : orderItems) {
            OrderItemDTO itemDTO = new OrderItemDTO();
            itemDTO.setName(item.getName());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setPrice(item.getPrice());
            itemDTO.setImage(item.getImage());
            itemDTOs.add(itemDTO);
            subtotal += item.getPrice() * item.getQuantity();
        }
        orderDetailsDTO.setItems(itemDTOs);
        // Calculate shipping, tax, and total (simple example)
        double shipping = 150.0;
        double tax = subtotal * 0.12;
        double total = subtotal + shipping + tax;
        orderDetailsDTO.setSubtotal(subtotal);
        orderDetailsDTO.setShipping(shipping);
        orderDetailsDTO.setTax(tax);
        orderDetailsDTO.setTotal(total);
        return ResponseEntity.ok(orderDetailsDTO);
    }    // Get all orders for a customer    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderDetailsDTO>> getOrdersByCustomer(@PathVariable Long customerId, Authentication authentication) {
        if (customerId == null) {
            logger.error("No customerId provided");
            return ResponseEntity.badRequest().body(null);
        }

        try {
            // Check authentication
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.error("Unauthenticated user attempted to access orders");
                return ResponseEntity.status(401).body(null);
            }

            // Get authenticated user
            String email = authentication.getName();
            Customer authenticatedCustomer = customerRepository.findByEmail(email);
            if (authenticatedCustomer == null) {
                logger.error("Customer not found for email: {}", email);
                return ResponseEntity.status(404).body(null);
            }

            // Verify the authenticated user is accessing their own orders
            if (!authenticatedCustomer.getId().equals(customerId)) {
                logger.error("User {} attempted to access orders for different customer {}", 
                    authenticatedCustomer.getId(), customerId);
                return ResponseEntity.status(403).body(null);
            }

            // Log successful authentication
            logger.info("User {} successfully authenticated to view orders", email);

            List<Order> orders = orderRepository.findByCustomerId(customerId);
            if (orders == null || orders.isEmpty()) {
                logger.warn("No orders found for customerId: {}", customerId);
                return ResponseEntity.ok(new ArrayList<>()); // Return empty list, not error
            }

            List<OrderDetailsDTO> orderDetailsList = new ArrayList<>();
            for (Order order : orders) {
                try {
                    CheckoutInformation checkoutInfo = checkoutInformationRepository.findByOrderId(order.getOrderId());
                    OrderDetailsDTO dto = new OrderDetailsDTO();
                    dto.setOrderId(order.getOrderId());
                    dto.setOrderDate(order.getOrderDate() != null ? order.getOrderDate().toString() : null);
                    dto.setStatus(order.getStatus());
                    
                    // Safely set checkout information fields
                    if (checkoutInfo != null) {
                        dto.setShippingMethod(checkoutInfo.getShippingMethod());
                        dto.setPaymentMethod(checkoutInfo.getPaymentMethod());
                        dto.setAddress(checkoutInfo.getShippingAddress());
                        dto.setCity(checkoutInfo.getCity());
                        dto.setState(checkoutInfo.getState());
                        dto.setZip(checkoutInfo.getZip());
                        dto.setCountry(checkoutInfo.getCountry());
                        dto.setFirstName(checkoutInfo.getFirstName());
                        dto.setLastName(checkoutInfo.getLastName());
                        dto.setEmail(checkoutInfo.getEmail());
                        dto.setPhone(checkoutInfo.getPhone());
                    }

                    // Fetch order items and map to DTOs
                    List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
                    List<OrderItemDTO> itemDTOs = new ArrayList<>();
                    double subtotal = 0.0;
                    for (OrderItem item : orderItems) {
                        try {
                            OrderItemDTO itemDTO = new OrderItemDTO();
                            itemDTO.setName(item.getName());
                            itemDTO.setQuantity(item.getQuantity());
                            itemDTO.setPrice(item.getPrice());
                            itemDTO.setImage(item.getImage());
                            itemDTOs.add(itemDTO);
                            subtotal += item.getPrice() * item.getQuantity();
                        } catch (Exception e) {
                            logger.warn("Error processing order item for order {}: {}", order.getOrderId(), e.getMessage());
                        }
                    }
                    dto.setItems(itemDTOs);

                    // Calculate shipping, tax, and total (match frontend)
                    double shipping = 150.0;
                    double tax = subtotal * 0.12;
                    double total = subtotal + shipping + tax;

                    dto.setSubtotal(subtotal);
                    dto.setShipping(shipping);
                    dto.setTax(tax);
                    dto.setTotal(total);

                    orderDetailsList.add(dto);
                } catch (Exception e) {
                    logger.error("Error processing order {} for customerId {}: {}", 
                        order.getOrderId(), customerId, e.getMessage());
                    // Continue processing other orders
                }
            }

            return ResponseEntity.ok(orderDetailsList);
        } catch (Exception e) {
            logger.error("Error loading orders for customerId {}: {}", customerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

  @PatchMapping("/{orderId}/status")
public ResponseEntity<String> updateOrderStatus(@PathVariable String orderId, @RequestBody Map<String, String> body) {
    String newStatus = body.get("status");
    if (newStatus == null || newStatus.trim().isEmpty()) {
        logger.warn("Missing or empty status in update request for order {}", orderId);
        return ResponseEntity.badRequest().body("Missing status");
    }

    Order order = orderRepository.findByOrderId(orderId);
    if (order == null) {
        logger.error("Order not found for orderId: {}", orderId);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found");
    }

    order.setStatus(newStatus);
    orderRepository.save(order);
    logger.info("Updated order {} status to {}", orderId, newStatus);
    return ResponseEntity.ok("Order status updated");
    }
}

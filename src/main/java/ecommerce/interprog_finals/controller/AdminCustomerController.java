package ecommerce.interprog_finals.controller;

import ecommerce.interprog_finals.entity.Customer;
import ecommerce.interprog_finals.entity.Order;
import ecommerce.interprog_finals.repository.CustomerRepository;
import ecommerce.interprog_finals.repository.OrderItemRepository;
import ecommerce.interprog_finals.repository.OrderRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class AdminCustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    // Get all customers (admin only)
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers(HttpSession session) {
        if (!Boolean.TRUE.equals(session.getAttribute("isAdmin"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<Customer> customers = customerRepository.findAll();
        // Attach orders and items to each customer
        for (Customer customer : customers) {
            List<Order> orders = orderRepository.findByCustomerId(customer.getId());
            for (Order order : orders) {
                order.setItems(orderItemRepository.findByOrder(order));
            }
            customer.setOrders(orders);
        }
        return ResponseEntity.ok(customers);
    }

    // Delete a customer by ID (admin only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id, HttpSession session) {
        if (!Boolean.TRUE.equals(session.getAttribute("isAdmin"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (!customerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        customerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Block a customer by ID (admin only)
    @PatchMapping("/{id}/block")
    public ResponseEntity<?> blockCustomer(@PathVariable Long id, HttpSession session) {
        if (!Boolean.TRUE.equals(session.getAttribute("isAdmin"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Customer customer = customerRepository.findById(id).orElse(null);
        if (customer == null) {
            return ResponseEntity.notFound().build();
        }
        customer.setBlocked(true);
        customerRepository.save(customer);
        return ResponseEntity.ok().build();
    }

    // Unblock a customer by ID (admin only)
    @PatchMapping("/{id}/unblock")
    public ResponseEntity<?> unblockCustomer(@PathVariable Long id, HttpSession session) {
        if (!Boolean.TRUE.equals(session.getAttribute("isAdmin"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Customer customer = customerRepository.findById(id).orElse(null);
        if (customer == null) {
            return ResponseEntity.notFound().build();
        }
        customer.setBlocked(false);
        customerRepository.save(customer);
        return ResponseEntity.ok().build();
    }
}

package ecommerce.interprog_finals.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ecommerce.interprog_finals.entity.Customer;
import ecommerce.interprog_finals.repository.CustomerRepository;
import ecommerce.interprog_finals.dto.LoginReq;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import ecommerce.interprog_finals.repository.CheckoutInformationRepository;
import ecommerce.interprog_finals.entity.CheckoutInformation;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CheckoutInformationRepository checkoutInformationRepository;

    public UserController(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            CheckoutInformationRepository checkoutInformationRepository
    ) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.checkoutInformationRepository = checkoutInformationRepository;
    }

    // Registration endpoint
    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@RequestBody Customer customer) {
        if (customerRepository.findByEmail(customer.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email already in use");
        }
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));
        customerRepository.save(customer);
        return ResponseEntity.ok("Customer registered successfully");
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> loginCustomer(@RequestBody LoginReq loginRequest, HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());

            String email = authentication.getName();
            Customer customer = customerRepository.findByEmail(email);
            if (customer == null) {
                return ResponseEntity.status(404).body("Customer not found");
            }
            if (customer.isBlocked()) {
                return ResponseEntity.status(403).body("Your account is blocked. Please contact support.");
            }
            return ResponseEntity.ok(Map.of(
                "id", customer.getId(),
                "firstName", customer.getFirstName(),
                "lastName", customer.getLastName(),
                "email", customer.getEmail(),
                "phone", customer.getPhone()
            ));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
    }

    // Logout endpoint
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        request.getSession().invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logged out successfully");
    }

    // Endpoint to get current logged-in customer's info
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentCustomer(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Not logged in"));
        }
        String email = authentication.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer != null) {
            // Fetch latest checkout info for this customer
            java.util.Optional<CheckoutInformation> checkoutOpt = checkoutInformationRepository.findTopByCustomerIdOrderByIdDesc(customer.getId());
            Map<String, Object> shippingAddress = Map.of();
            if (checkoutOpt.isPresent()) {
                CheckoutInformation checkout = checkoutOpt.get();
                shippingAddress = Map.of(
                    "street", checkout.getShippingAddress(),
                    "city", checkout.getCity(),
                    "state", checkout.getState(),
                    "zipCode", checkout.getZip(),
                    "country", checkout.getCountry()
                );
            }
            return ResponseEntity.ok(Map.of(
                "id", customer.getId(),
                "firstName", customer.getFirstName(),
                "lastName", customer.getLastName(),
                "email", customer.getEmail(),
                "phone", customer.getPhone(),
                "username", customer.getFirstName() + " " + customer.getLastName(),
                "shippingAddress", shippingAddress
            ));
        }
        return ResponseEntity.status(404).body(Map.of("message", "Customer not found"));
    }
}
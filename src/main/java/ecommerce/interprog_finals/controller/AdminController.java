package ecommerce.interprog_finals.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ecommerce.interprog_finals.repository.ProductRepository;
import ecommerce.interprog_finals.entity.LoginReq;
import ecommerce.interprog_finals.entity.Product;
import org.springframework.http.HttpStatus;
import java.util.List;
import ecommerce.interprog_finals.repository.AdminUserRepository;
import ecommerce.interprog_finals.entity.AdminUser;
import org.springframework.security.crypto.password.PasswordEncoder;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AdminUserRepository adminUserRepository;
    
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginReq request, HttpSession session) {
        System.out.println("[DEBUG] Admin login endpoint called");
        AdminUser admin = adminUserRepository.findByUsernameIgnoreCase(request.getUsername());
        if (admin != null &&
            "ADMIN".equalsIgnoreCase(admin.getRole()) &&
            passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            session.setAttribute("isAdmin", true);
            session.setAttribute("adminUsername", admin.getUsername());
            session.setMaxInactiveInterval(60 * 60); // 1 hour session timeout
            System.out.println("[DEBUG] Admin session created. Session ID: " + session.getId());
            return ResponseEntity.ok("Login successful");
        }
        System.out.println("[DEBUG] Admin login failed for username: " + request.getUsername());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid admin credentials");
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts(HttpSession session) {
        if (!Boolean.TRUE.equals(session.getAttribute("isAdmin"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(productRepository.findAll());
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product, HttpSession session) {
        if (!Boolean.TRUE.equals(session.getAttribute("isAdmin"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(productRepository.save(product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, HttpSession session) {
        if (!Boolean.TRUE.equals(session.getAttribute("isAdmin"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getAdminSession(HttpSession session) {
        Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
        String adminUsername = (String) session.getAttribute("adminUsername");
        if (Boolean.TRUE.equals(isAdmin)) {
            return ResponseEntity.ok().body(java.util.Map.of(
                "isAdmin", true,
                "username", adminUsername
            ));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("isAdmin", false));
    }
}
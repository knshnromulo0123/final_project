package ecommerce.interprog_finals.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import ecommerce.interprog_finals.entity.AdminUser;
import ecommerce.interprog_finals.repository.AdminUserRepository;
import java.time.LocalDateTime;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminUsername = "admin@gearuparena.com";

        AdminUser existingAdmin = adminUserRepository.findByUsernameIgnoreCase(adminUsername);
        
        if (existingAdmin == null) {
            AdminUser admin = new AdminUser();
            admin.setUsername(adminUsername);
            admin.setPassword(passwordEncoder.encode("gua123")); // Encrypt the password
            admin.setRole("ADMIN");
            admin.setCreatedAt(LocalDateTime.now());
            adminUserRepository.save(admin);
            
            System.out.println("Admin user created successfully");
        } else {
            // Optionally update existing admin password
            existingAdmin.setPassword(passwordEncoder.encode("gua123"));
            adminUserRepository.save(existingAdmin);
            
            System.out.println("Admin user password updated");
        }
    }
}

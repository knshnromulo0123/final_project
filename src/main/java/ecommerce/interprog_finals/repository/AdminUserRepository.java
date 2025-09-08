package ecommerce.interprog_finals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ecommerce.interprog_finals.entity.AdminUser;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    AdminUser findByUsernameIgnoreCase(String username);
}

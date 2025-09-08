package ecommerce.interprog_finals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ecommerce.interprog_finals.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Customer findByEmail(String email);
}
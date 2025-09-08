package ecommerce.interprog_finals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ecommerce.interprog_finals.entity.CheckoutInformation;

public interface CheckoutInformationRepository extends JpaRepository<CheckoutInformation, Long> {
    CheckoutInformation findByOrderId(String orderId);
    java.util.Optional<CheckoutInformation> findTopByCustomerIdOrderByIdDesc(Long customerId);
}
package ecommerce.interprog_finals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ecommerce.interprog_finals.entity.Order;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
    Order findByOrderId(String orderId);
}
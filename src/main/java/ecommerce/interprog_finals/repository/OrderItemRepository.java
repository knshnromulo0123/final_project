package ecommerce.interprog_finals.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ecommerce.interprog_finals.entity.OrderItem;
import ecommerce.interprog_finals.entity.Order;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);
    List<OrderItem> findByOrderId(Long orderId);
}

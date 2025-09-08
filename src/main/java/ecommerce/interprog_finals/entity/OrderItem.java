package ecommerce.interprog_finals.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonBackReference
    private Order order;

    @Column(name = "product_id")
    private Long productId;

    private int quantity;
    private double price;

    private String name;
    private String image;

    public OrderItem() {

    }

    // Getters and setters
    public Long getId() { 
        return id; 
    }
    public void setId(Long id) { 
        this.id = id; 
    }

    public Order getOrder() { 
        return order; 
    }
    public void setOrder(Order order) { 
        this.order = order; 
    }

    public Long getProductId() { 
        return productId; }

    public void setProductId(Long productId) { 
        this.productId = productId; 
    }

    public int getQuantity() { 
        return quantity; 
    }
    public void setQuantity(int quantity) { 
        this.quantity = quantity; 
    }

    public double getPrice() { 
        return price; 
    }
    public void setPrice(double price) { 
        this.price = price; 
    }

    public String getName() { 
        return name; 
    }
    public void setName(String name) { 
        this.name = name; 
    }

    public String getImage() { 
        return image; 
    }
    public void setImage(String image) { 
        this.image = image; 
    }
}

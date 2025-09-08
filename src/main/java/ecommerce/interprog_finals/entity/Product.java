package ecommerce.interprog_finals.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String sku;
    private String category;
    private Double price;
    private Integer stock;
    private String status;
    private String image;
    private String description;
    private String brand;
    private String features; 
    private String specifications;

    // Getters and setters
    public Long getId() { 
        return id; 
    }
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getName() { 
        return name; 
    }
    public void setName(String name) { 
        this.name = name; 
    }

    public String getSku() { 
        return sku; 
    }
    public void setSku(String sku) { 
        this.sku = sku; 
    }

    public String getCategory() { 
        return category; 
    }
    public void setCategory(String category) { 
        this.category = category; 
    }

    public Double getPrice() { 
        return price; 
    }
    public void setPrice(Double price) { 
        this.price = price; 
    }

    public Integer getStock() { 
        return stock; 
    }
    public void setStock(Integer stock) { 
        this.stock = stock; 
    }

    public String getStatus() { 
        return status; 
    }
    public void setStatus(String status) { 
        this.status = status; 
    }

    public String getImage() { 
        return image; 
    }
    public void setImage(String image) { 
        this.image = image; 
    }

    public String getDescription() { 
        return description; 
    }
    public void setDescription(String description) { 
        this.description = description; 
    }

    public String getBrand() { 
        return brand; 
    }
    public void setBrand(String brand) { 
        this.brand = brand; 
    }

    public String getFeatures() { 
        return features; 
    }
    public void setFeatures(String features) { 
        this.features = features; 
    }

    public String getSpecifications() { 
        return specifications; }

    public void setSpecifications(String specifications) { 
        this.specifications = specifications; 
    }
}
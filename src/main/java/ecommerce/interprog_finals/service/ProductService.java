package ecommerce.interprog_finals.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ecommerce.interprog_finals.entity.Product;
import ecommerce.interprog_finals.repository.ProductRepository;
import java.util.List;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
      public List<Product> getAllProducts() {
        List<Product> products = productRepository.findAll();
        System.out.println("Number of products found in database: " + products.size());
        return products;
    }
    

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product product = getProductById(id);
        if (product == null) throw new RuntimeException("Product not found");
        product.setName(updatedProduct.getName());
        product.setSku(updatedProduct.getSku());
        product.setCategory(updatedProduct.getCategory());
        product.setPrice(updatedProduct.getPrice());
        product.setStock(updatedProduct.getStock());
        product.setStatus(updatedProduct.getStatus());
        product.setImage(updatedProduct.getImage());
        product.setBrand(updatedProduct.getBrand());
        product.setDescription(updatedProduct.getDescription());
        product.setFeatures(updatedProduct.getFeatures());
        product.setSpecifications(updatedProduct.getSpecifications());
        return saveProduct(product);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }
    
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}

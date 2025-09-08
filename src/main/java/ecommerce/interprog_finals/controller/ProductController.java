package ecommerce.interprog_finals.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ecommerce.interprog_finals.entity.Product;
import ecommerce.interprog_finals.service.ProductService;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        // Ensure all image paths are correct before returning
        for (Product product : products) {
            if (product.getImage() != null && !product.getImage().isEmpty() && !product.getImage().startsWith("/uploads/")) {
                product.setImage("/uploads/placeholders/" + product.getImage().replaceAll("^/+", ""));
            }
        }
        System.out.println("Number of products returned from service: " + products.size());
        return products;
    }

    @PostMapping
    public Product addProduct(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product updatedProduct) {
        return productService.updateProduct(id, updatedProduct);
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}

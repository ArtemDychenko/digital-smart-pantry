package com.smartpantry.backend.controller;

import com.smartpantry.backend.dto.SearchResult;
import com.smartpantry.backend.model.Product;
import com.smartpantry.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class PantryController {
    private final ProductRepository productRepository;

    @GetMapping
    public SearchResult<Product> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return new SearchResult<>(products, products.size());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product createNewProduct(@RequestBody Product item) {
        Optional<Product> existing = productRepository.findByNameIgnoreCase(item.getName());
        if (existing.isPresent()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product already exist with that name");
        }
        item.setId(null);
        return productRepository.save(item);
    }

    @PatchMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product item) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        item.setId(id);
        return productRepository.save(item);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
    }
}

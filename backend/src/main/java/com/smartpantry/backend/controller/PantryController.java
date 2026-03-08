package com.smartpantry.backend.controller;

import com.smartpantry.backend.dto.SearchResult;
import com.smartpantry.backend.model.Product;
import com.smartpantry.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PantryController {
    private final ProductRepository productRepository;

    @GetMapping("/products")
    public SearchResult<Product> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return new SearchResult<>(products, products.size());
    }
}

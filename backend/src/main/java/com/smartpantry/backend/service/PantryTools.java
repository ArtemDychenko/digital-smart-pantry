package com.smartpantry.backend.service;

import com.smartpantry.backend.model.Product;
import com.smartpantry.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PantryTools {

    private final ProductRepository productRepository;

    @Tool(description = "Add a product to the pantry. If the product already exists, increase its quantity by the given amount.")
    public String addProduct(@ToolParam(description = "Product name") String name,
                             @ToolParam(description = "Quantity to add") int quantity) {
        Optional<Product> existing = productRepository.findByNameIgnoreCase(name);
        if (existing.isPresent()) {
            Product product = existing.get();
            product.setQuantity(product.getQuantity() + quantity);
            productRepository.save(product);
            PantryToolContext.recordAction("update", product.getName(), product.getQuantity());
            return "Updated " + product.getName() + ", new quantity: " + product.getQuantity();
        }
        Product product = Product.builder()
                .name(name)
                .quantity(quantity)
                .build();
        productRepository.save(product);
        PantryToolContext.recordAction("add", name, quantity);
        return "Added " + name + " with quantity " + quantity;
    }

    @Tool(description = "Update the exact quantity of a product in the pantry.")
    public String updateProduct(@ToolParam(description = "Product name") String name,
                                @ToolParam(description = "New quantity") int quantity) {
        Optional<Product> existing = productRepository.findByNameIgnoreCase(name);
        if (existing.isPresent()) {
            Product product = existing.get();
            product.setQuantity(quantity);
            productRepository.save(product);
            PantryToolContext.recordAction("update", product.getName(), quantity);
            return "Updated " + product.getName() + " to quantity " + quantity;
        }
        return "Product " + name + " not found in the pantry.";
    }

    @Tool(description = "Remove a product from the pantry completely.")
    public String deleteProduct(@ToolParam(description = "Product name") String name) {
        Optional<Product> existing = productRepository.findByNameIgnoreCase(name);
        if (existing.isPresent()) {
            productRepository.delete(existing.get());
            return "Removed " + name + " from the pantry.";
        }
        return "Product " + name + " not found in the pantry.";
    }

    @Tool(description = "Get the quantity of a specific product in the pantry.")
    public String getProduct(@ToolParam(description = "Product name") String name) {
        Optional<Product> existing = productRepository.findByNameIgnoreCase(name);
        if (existing.isPresent()) {
            Product product = existing.get();
            PantryToolContext.recordAction("get", product.getName(), product.getQuantity());
            return product.getName() + ": " + product.getQuantity();
        }
        return "Product " + name + " not found in the pantry.";
    }

    @Tool(description = "List all products currently in the pantry with their quantities.")
    public String listProducts() {
        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            return "The pantry is empty.";
        }
        return products.stream()
                .map(p -> p.getName() + ": " + p.getQuantity())
                .collect(Collectors.joining("\n"));
    }
}

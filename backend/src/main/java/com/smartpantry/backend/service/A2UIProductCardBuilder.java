package com.smartpantry.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;


@Component
public class A2UIProductCardBuilder {

    private static final Logger log = LoggerFactory.getLogger(A2UIProductCardBuilder.class);

    private final List<Map<String, Object>> cardComponents;

    public A2UIProductCardBuilder(ObjectMapper objectMapper) throws IOException {
        InputStream is = getClass().getResourceAsStream("/a2ui/product-card.json");
        if (is == null) {
            throw new IOException("A2UI template not found: /a2ui/product-card.json");
        }
        cardComponents = objectMapper.readValue(is, new TypeReference<>() {});
        log.info("A2UI product card template loaded ({} components)", cardComponents.size());
    }

    private boolean validateMessages(String surfaceId, List<Map<String, Object>> messages,
                                     String expectedName, int expectedQuantity) {
        boolean hasSurfaceUpdate = messages.stream().anyMatch(m -> m.containsKey("surfaceUpdate"));
        boolean hasDataModel    = messages.stream().anyMatch(m -> m.containsKey("dataModelUpdate"));
        boolean hasBeginRender  = messages.stream().anyMatch(m -> m.containsKey("beginRendering"));

        if (!hasSurfaceUpdate || !hasDataModel || !hasBeginRender) {
            log.warn("A2UI validation failed for surface '{}': missing message types "
                    + "(surfaceUpdate={}, dataModelUpdate={}, beginRendering={})",
                    surfaceId, hasSurfaceUpdate, hasDataModel, hasBeginRender);
            return false;
        }

        return messages.stream()
                .filter(m -> m.containsKey("dataModelUpdate"))
                .map(m -> (Map<?, ?>) m.get("dataModelUpdate"))
                .flatMap(dm -> ((List<?>) dm.get("contents")).stream())
                .filter(entry -> "product".equals(((Map<?, ?>) entry).get("key")))
                .findFirst()
                .map(entry -> {
                    List<?> valueMap = (List<?>) ((Map<?, ?>) entry).get("valueMap");
                    if (valueMap == null || valueMap.size() < 2) {
                        log.warn("A2UI validation failed for surface '{}': incomplete product data", surfaceId);
                        return false;
                    }

                    String actualName = extractValueString(valueMap, "name");
                    String actualQuantity = extractValueString(valueMap, "quantity");
                    String expectedQuantityStr = "Quantity: " + expectedQuantity;

                    if (!expectedName.equals(actualName)) {
                        log.warn("A2UI validation failed for surface '{}': name mismatch — "
                                + "expected '{}', got '{}'", surfaceId, expectedName, actualName);
                        return false;
                    }
                    if (!expectedQuantityStr.equals(actualQuantity)) {
                        log.warn("A2UI validation failed for surface '{}': quantity mismatch — "
                                + "expected '{}', got '{}'", surfaceId, expectedQuantityStr, actualQuantity);
                        return false;
                    }

                    return true;
                })
                .orElseGet(() -> {
                    log.warn("A2UI validation failed for surface '{}': missing 'product' key", surfaceId);
                    return false;
                });
    }

    private String extractValueString(List<?> valueMap, String key) {
        return valueMap.stream()
                .map(item -> (Map<?, ?>) item)
                .filter(item -> key.equals(item.get("key")))
                .map(item -> (String) item.get("valueString"))
                .findFirst()
                .orElse(null);
    }

    public List<Map<String, Object>> buildProductCard(String surfaceId, String productName, int quantity) {
        // --- Input validation ---
        if (surfaceId == null || surfaceId.isBlank()) {
            log.warn("A2UI card skipped: surfaceId is blank");
            return List.of();
        }
        if (productName == null || productName.isBlank()) {
            log.warn("A2UI card skipped for surface '{}': productName is blank", surfaceId);
            return List.of();
        }
        if (quantity < 0) {
            log.warn("A2UI card skipped for surface '{}': quantity is negative ({})", surfaceId, quantity);
            return List.of();
        }

        Map<String, Object> surfaceUpdate = Map.of(
                "surfaceUpdate", Map.of(
                        "surfaceId", surfaceId,
                        "components", cardComponents
                )
        );

        Map<String, Object> dataModelUpdate = Map.of(
                "dataModelUpdate", Map.of(
                        "surfaceId", surfaceId,
                        "contents", List.of(
                                Map.<String, Object>of(
                                        "key", "product",
                                        "valueMap", List.of(
                                                Map.<String, Object>of("key", "name", "valueString", productName),
                                                Map.<String, Object>of("key", "quantity", "valueString", "Quantity: " + quantity),
                                                Map.<String, Object>of("key", "quantityRaw", "valueString", String.valueOf(quantity))
                                        )
                                )
                        )
                )
        );

        Map<String, Object> beginRendering = Map.of(
                "beginRendering", Map.of(
                        "surfaceId", surfaceId,
                        "root", "root"
                )
        );

        List<Map<String, Object>> messages = List.of(surfaceUpdate, dataModelUpdate, beginRendering);

        // --- Output validation ---
        if (!validateMessages(surfaceId, messages, productName, quantity)) {
        return List.of();
        }

        log.debug("A2UI card built for '{}' (quantity={})", productName, quantity);
        return messages;
    }
}

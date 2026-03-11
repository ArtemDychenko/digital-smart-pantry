package com.smartpantry.backend.controller;

import com.smartpantry.backend.dto.LLMRequest;
import com.smartpantry.backend.dto.LLMResponse;
import com.smartpantry.backend.service.A2UIProductCardBuilder;
import com.smartpantry.backend.service.LLMService;
import com.smartpantry.backend.service.PantryToolContext;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class LLMController {
    private static final Logger log = LoggerFactory.getLogger(LLMController.class);
    private static final int MAX_A2UI_RETRIES = 2;

    private final LLMService llmService;
    private final A2UIProductCardBuilder a2uiBuilder;
    
    @PostMapping(value = "/command-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter commandStream(@RequestBody LLMRequest request,
                                    @CookieValue(name = "conversation-id") String conversationId) {
        SseEmitter emitter = new SseEmitter(120_000L);

        CompletableFuture.runAsync(() -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("working")
                        .data(Map.of("status", "Thinking\u2026"), MediaType.APPLICATION_JSON));

                String response = llmService.process(request.userPrompt(), conversationId);
                List<PantryToolContext.ProductAction> actions = PantryToolContext.getAndClear();

                emitter.send(SseEmitter.event()
                        .name("complete")
                        .data(new LLMResponse(response, buildA2UIMessages(actions)), MediaType.APPLICATION_JSON));
                emitter.complete();
            } catch (Exception e) {
                log.error("SSE stream error for prompt: {}", request.userPrompt(), e);
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    private List<Map<String, Object>> buildA2UIMessages(List<PantryToolContext.ProductAction> actions) {
        if (actions.isEmpty()) return null;
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < actions.size(); i++) {
            result.addAll(buildCardWithRetries(actions.get(i), i));
        }
        return result.isEmpty() ? null : result;
    }

    private List<Map<String, Object>> buildCardWithRetries(PantryToolContext.ProductAction action, int index) {
        for (int attempt = 1; attempt <= MAX_A2UI_RETRIES + 1; attempt++) {
            String surfaceId = "product-card-" + System.currentTimeMillis() + "-" + index;
            List<Map<String, Object>> cardMessages =
                    a2uiBuilder.buildProductCard(surfaceId, action.name(), action.quantity());

            if (!cardMessages.isEmpty()) {
                if (attempt > 1) {
                    log.info("A2UI card for '{}' succeeded on retry attempt {}/{}", action.name(), attempt - 1, MAX_A2UI_RETRIES);
                }
                return cardMessages;
            }

            if (attempt <= MAX_A2UI_RETRIES) {
                log.warn("A2UI card validation failed for '{}' (attempt {}/{}), retrying...",
                        action.name(), attempt, MAX_A2UI_RETRIES + 1);
            }
        }

        log.error("A2UI card for '{}' skipped — max retries ({}) exhausted. "
                + "Action: type={}, name={}, quantity={}",
                action.name(), MAX_A2UI_RETRIES,
                action.actionType(), action.name(), action.quantity());
        return List.of();
    }
}

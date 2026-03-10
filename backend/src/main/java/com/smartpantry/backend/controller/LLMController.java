package com.smartpantry.backend.controller;

import com.smartpantry.backend.dto.LLMRequest;
import com.smartpantry.backend.dto.LLMResponse;
import com.smartpantry.backend.service.LLMService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class LLMController {
    private final LLMService llmService;

    @PostMapping("/command")
    public LLMResponse command(@RequestBody LLMRequest userPrompt,
                               @CookieValue(name = "conversation-id") String conversationId) {
        String response = llmService.process(userPrompt.userPrompt(), conversationId);
        return new LLMResponse(response);
    }
}

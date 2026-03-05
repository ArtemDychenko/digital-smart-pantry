package com.smartpantry.api.controller;

import com.smartpantry.api.service.LLMService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class LLMController {
    private final LLMService llmService;

    @GetMapping("/command")
    public void command(@RequestParam String userPrompt) {
         System.out.println(llmService.process(userPrompt));
    }
}

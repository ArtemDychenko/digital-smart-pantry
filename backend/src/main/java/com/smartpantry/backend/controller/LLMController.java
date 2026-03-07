package com.smartpantry.backend.controller;

import com.smartpantry.backend.service.LLMService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class LLMController {
    private final LLMService llmService;

    @GetMapping("/command")
    public void command(@RequestBody String userPrompt) {
         System.out.println(llmService.process(userPrompt));
    }
}

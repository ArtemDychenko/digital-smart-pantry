package com.smartpantry.backend.dto;

public record LLMResponse(
    String action,
    String item,
    Integer quantity
) {}

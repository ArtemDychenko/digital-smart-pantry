package com.smartpantry.api.dto;

public record LLMResponse(
    String action,
    String item,
    Integer quantity
) {}

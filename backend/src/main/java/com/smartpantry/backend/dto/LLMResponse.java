package com.smartpantry.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record LLMResponse(
    String message,
    List<Map<String, Object>> a2uiMessages
) {}
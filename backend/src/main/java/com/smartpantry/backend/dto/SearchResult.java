package com.smartpantry.backend.dto;

import java.util.List;

public record SearchResult<T>(List<T> result, int total) {
}


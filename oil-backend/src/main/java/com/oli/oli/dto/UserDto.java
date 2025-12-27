package com.oli.oli.dto;

import java.time.Instant;

public record UserDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        Instant createdAt,
        Instant updatedAt
) {
}

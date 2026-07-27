package com.pulseracing.dto;

import java.time.Instant;
import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt,
        UserSummary user) {

    public record UserSummary(UUID id, String username, String email) {
    }
}

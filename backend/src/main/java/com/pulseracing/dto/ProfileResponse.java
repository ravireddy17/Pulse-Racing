package com.pulseracing.dto;

import com.pulseracing.entity.CarColor;
import com.pulseracing.entity.User;
import java.time.Instant;
import java.util.UUID;

public record ProfileResponse(
        UUID id,
        String username,
        String email,
        int coins,
        long experience,
        int gamesPlayed,
        Long bestTimeMs,
        int highestLevel,
        CarColor selectedCarColor,
        Instant dateJoined,
        Instant lastLogin) {

    public static ProfileResponse from(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCoins(),
                user.getExperience(),
                user.getTotalRaces(),
                user.getBestTimeMs(),
                user.getHighestUnlockedLevel(),
                user.getSelectedCarColor(),
                user.getCreatedAt(),
                user.getLastLoginAt());
    }
}

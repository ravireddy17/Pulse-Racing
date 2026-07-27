package com.pulseracing.dto;

import com.pulseracing.entity.LeaderboardEntry;

public record LeaderboardResponse(
        int rank,
        String username,
        long bestTimeMs,
        int totalWins) {

    public static LeaderboardResponse from(int rank, LeaderboardEntry entry) {
        return new LeaderboardResponse(
                rank,
                entry.getUser().getUsername(),
                entry.getBestTimeMs(),
                entry.getTotalWins());
    }
}

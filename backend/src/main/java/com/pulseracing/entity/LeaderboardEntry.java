package com.pulseracing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "leaderboard")
public class LeaderboardEntry {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "best_time_ms")
    private Long bestTimeMs;

    @Column(name = "total_wins", nullable = false)
    private int totalWins;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected LeaderboardEntry() {
    }

    public LeaderboardEntry(User user) {
        this.id = UUID.randomUUID();
        this.user = user;
        this.totalWins = 0;
        this.updatedAt = Instant.now();
    }

    public void recordWin(long raceTimeMs) {
        this.totalWins += 1;
        if (this.bestTimeMs == null || raceTimeMs < this.bestTimeMs) {
            this.bestTimeMs = raceTimeMs;
        }
        this.updatedAt = Instant.now();
    }

    public User getUser() {
        return user;
    }

    public Long getBestTimeMs() {
        return bestTimeMs;
    }

    public int getTotalWins() {
        return totalWins;
    }
}

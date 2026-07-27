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
@Table(name = "game_saves")
public class GameSave {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "current_level", nullable = false)
    private int currentLevel;

    @Column(nullable = false)
    private int coins;

    @Column(name = "best_time_ms")
    private Long bestTimeMs;

    @Column(name = "unlocked_maps", nullable = false, length = 128)
    private String unlockedMaps;

    @Column(name = "master_volume", nullable = false)
    private int masterVolume;

    @Column(name = "reduced_motion", nullable = false)
    private boolean reducedMotion;

    @Column(name = "last_played_at", nullable = false)
    private Instant lastPlayedAt;

    protected GameSave() {
    }

    public GameSave(User user) {
        this.id = UUID.randomUUID();
        this.user = user;
        this.currentLevel = 1;
        this.coins = user.getCoins();
        this.unlockedMaps = "green-hills";
        this.masterVolume = 80;
        this.reducedMotion = false;
        this.lastPlayedAt = Instant.now();
    }

    public void recordRace(User player, long raceTimeMs) {
        this.currentLevel = player.getHighestUnlockedLevel();
        this.coins = player.getCoins();
        if (this.bestTimeMs == null || raceTimeMs < this.bestTimeMs) {
            this.bestTimeMs = raceTimeMs;
        }
        if (player.getHighestUnlockedLevel() >= 2) {
            this.unlockedMaps = "green-hills,desert-track";
        }
        this.lastPlayedAt = Instant.now();
    }

    public void updateSettings(int masterVolume, boolean reducedMotion) {
        this.masterVolume = masterVolume;
        this.reducedMotion = reducedMotion;
        this.lastPlayedAt = Instant.now();
    }

    public int getCurrentLevel() {
        return currentLevel;
    }

    public int getCoins() {
        return coins;
    }

    public Long getBestTimeMs() {
        return bestTimeMs;
    }

    public String getUnlockedMaps() {
        return unlockedMaps;
    }

    public int getMasterVolume() {
        return masterVolume;
    }

    public boolean isReducedMotion() {
        return reducedMotion;
    }

    public Instant getLastPlayedAt() {
        return lastPlayedAt;
    }
}

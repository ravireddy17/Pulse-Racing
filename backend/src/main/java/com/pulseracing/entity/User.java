package com.pulseracing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 30)
    private String username;

    @Column(name = "username_key", nullable = false, unique = true, length = 30)
    private String usernameKey;

    @Column(nullable = false, unique = true, length = 254)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 72)
    private String passwordHash;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "total_races", nullable = false)
    private int totalRaces;

    @Column(name = "best_time_ms")
    private Long bestTimeMs;

    @Column(nullable = false)
    private int coins;

    @Column(nullable = false)
    private long experience;

    @Column(name = "highest_unlocked_level", nullable = false)
    private int highestUnlockedLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "selected_car_color", nullable = false, length = 16)
    private CarColor selectedCarColor;

    protected User() {
    }

    public User(String username, String email, String passwordHash) {
        this.id = UUID.randomUUID();
        this.username = username;
        this.usernameKey = username.toLowerCase(Locale.ROOT);
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = Instant.now();
        this.totalRaces = 0;
        this.coins = 0;
        this.experience = 0;
        this.highestUnlockedLevel = 1;
        this.selectedCarColor = CarColor.RED;
    }

    public void recordLogin(Instant loginTime) {
        this.lastLoginAt = loginTime;
    }

    public void updateIdentity(String username) {
        this.username = username;
        this.usernameKey = username.toLowerCase(Locale.ROOT);
    }

    public void selectCarColor(CarColor carColor) {
        this.selectedCarColor = carColor;
    }

    public void recordRace(long raceTimeMs, int coinReward, long experienceReward) {
        this.totalRaces += 1;
        this.coins += coinReward;
        this.experience += experienceReward;
        if (this.bestTimeMs == null || raceTimeMs < this.bestTimeMs) {
            this.bestTimeMs = raceTimeMs;
        }
        this.highestUnlockedLevel = Math.max(
                this.highestUnlockedLevel,
                this.totalRaces > 0 ? 2 : 1);
    }

    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public int getTotalRaces() {
        return totalRaces;
    }

    public Long getBestTimeMs() {
        return bestTimeMs;
    }

    public int getCoins() {
        return coins;
    }

    public long getExperience() {
        return experience;
    }

    public int getHighestUnlockedLevel() {
        return highestUnlockedLevel;
    }

    public CarColor getSelectedCarColor() {
        return selectedCarColor;
    }
}

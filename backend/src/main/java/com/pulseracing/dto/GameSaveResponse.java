package com.pulseracing.dto;

import com.pulseracing.entity.GameSave;
import java.time.Instant;
import java.util.List;

public record GameSaveResponse(
        int currentLevel,
        int coins,
        Long bestTimeMs,
        List<String> unlockedMaps,
        Settings settings,
        Instant lastPlayedTime) {

    public static GameSaveResponse from(GameSave save) {
        return new GameSaveResponse(
                save.getCurrentLevel(),
                save.getCoins(),
                save.getBestTimeMs(),
                List.of(save.getUnlockedMaps().split(",")),
                new Settings(save.getMasterVolume(), save.isReducedMotion()),
                save.getLastPlayedAt());
    }

    public record Settings(int masterVolume, boolean reducedMotion) {
    }
}

package com.pulseracing.service;

import com.pulseracing.dto.GameSaveResponse;
import com.pulseracing.dto.LeaderboardResponse;
import com.pulseracing.dto.SaveGameRequest;
import com.pulseracing.dto.UpdateSettingsRequest;
import com.pulseracing.entity.GameSave;
import com.pulseracing.entity.LeaderboardEntry;
import com.pulseracing.entity.User;
import com.pulseracing.repository.GameSaveRepository;
import com.pulseracing.repository.LeaderboardRepository;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GameProgressService {

    private static final int COIN_REWARD = 250;
    private static final long EXPERIENCE_REWARD = 100;

    private final AuthenticatedUserService authenticatedUserService;
    private final GameSaveRepository gameSaveRepository;
    private final LeaderboardRepository leaderboardRepository;

    public GameProgressService(
            AuthenticatedUserService authenticatedUserService,
            GameSaveRepository gameSaveRepository,
            LeaderboardRepository leaderboardRepository) {
        this.authenticatedUserService = authenticatedUserService;
        this.gameSaveRepository = gameSaveRepository;
        this.leaderboardRepository = leaderboardRepository;
    }

    @Transactional(readOnly = true)
    public GameSaveResponse getSave(Jwt jwt) {
        User user = authenticatedUserService.requireUser(jwt);
        GameSave save = gameSaveRepository.findByUserId(user.getId())
                .orElseGet(() -> new GameSave(user));
        return GameSaveResponse.from(save);
    }

    @Transactional
    public GameSaveResponse saveRace(Jwt jwt, SaveGameRequest request) {
        User user = authenticatedUserService.requireUser(jwt);
        user.recordRace(request.raceTimeMs(), COIN_REWARD, EXPERIENCE_REWARD);

        GameSave save = gameSaveRepository.findByUserId(user.getId())
                .orElseGet(() -> new GameSave(user));
        save.recordRace(user, request.raceTimeMs());
        if (request.masterVolume() != null && request.reducedMotion() != null) {
            save.updateSettings(request.masterVolume(), request.reducedMotion());
        }
        gameSaveRepository.save(save);

        LeaderboardEntry entry = leaderboardRepository.findByUserId(user.getId())
                .orElseGet(() -> new LeaderboardEntry(user));
        entry.recordWin(request.raceTimeMs());
        leaderboardRepository.save(entry);
        return GameSaveResponse.from(save);
    }

    @Transactional
    public GameSaveResponse updateSettings(Jwt jwt, UpdateSettingsRequest request) {
        User user = authenticatedUserService.requireUser(jwt);
        GameSave save = gameSaveRepository.findByUserId(user.getId())
                .orElseGet(() -> new GameSave(user));
        save.updateSettings(request.masterVolume(), request.reducedMotion());
        return GameSaveResponse.from(gameSaveRepository.save(save));
    }

    @Transactional(readOnly = true)
    public List<LeaderboardResponse> leaderboard() {
        AtomicInteger rank = new AtomicInteger(1);
        return leaderboardRepository
                .findTop20ByBestTimeMsIsNotNullOrderByBestTimeMsAscTotalWinsDesc()
                .stream()
                .map(entry -> LeaderboardResponse.from(rank.getAndIncrement(), entry))
                .toList();
    }
}

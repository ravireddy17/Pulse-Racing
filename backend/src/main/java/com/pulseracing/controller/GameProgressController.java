package com.pulseracing.controller;

import com.pulseracing.dto.GameSaveResponse;
import com.pulseracing.dto.LeaderboardResponse;
import com.pulseracing.dto.SaveGameRequest;
import com.pulseracing.dto.UpdateSettingsRequest;
import com.pulseracing.service.GameProgressService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class GameProgressController {

    private final GameProgressService gameProgressService;

    public GameProgressController(GameProgressService gameProgressService) {
        this.gameProgressService = gameProgressService;
    }

    @GetMapping("/save")
    public GameSaveResponse getSave(@AuthenticationPrincipal Jwt jwt) {
        return gameProgressService.getSave(jwt);
    }

    @PostMapping("/save")
    public GameSaveResponse saveRace(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SaveGameRequest request) {
        return gameProgressService.saveRace(jwt, request);
    }

    @PutMapping("/save/settings")
    public GameSaveResponse updateSettings(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateSettingsRequest request) {
        return gameProgressService.updateSettings(jwt, request);
    }

    @GetMapping("/leaderboard")
    public List<LeaderboardResponse> leaderboard() {
        return gameProgressService.leaderboard();
    }
}

package com.pulseracing.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.pulseracing.repository.GameSaveRepository;
import com.pulseracing.repository.LeaderboardRepository;
import com.pulseracing.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:progress;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.jpa.hibernate.ddl-auto=validate"
})
@AutoConfigureMockMvc
class ProgressControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameSaveRepository gameSaveRepository;

    @Autowired
    private LeaderboardRepository leaderboardRepository;

    @BeforeEach
    void clearData() {
        leaderboardRepository.deleteAll();
        gameSaveRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void savesRaceRewardsUpdatesProfileAndPublishesLeaderboard() throws Exception {
        String token = register("apex_driver", "driver@example.com");

        mockMvc.perform(post("/api/save")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "trackId": "green-hills",
                                  "raceTimeMs": 93421,
                                  "masterVolume": 65,
                                  "reducedMotion": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentLevel").value(2))
                .andExpect(jsonPath("$.coins").value(250))
                .andExpect(jsonPath("$.bestTimeMs").value(93421))
                .andExpect(jsonPath("$.unlockedMaps[1]").value("desert-track"))
                .andExpect(jsonPath("$.settings.masterVolume").value(65));

        mockMvc.perform(get("/api/profile")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gamesPlayed").value(1))
                .andExpect(jsonPath("$.experience").value(100))
                .andExpect(jsonPath("$.coins").value(250));

        mockMvc.perform(put("/api/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "new_driver",
                                  "selectedCarColor": "SILVER"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("new_driver"))
                .andExpect(jsonPath("$.selectedCarColor").value("SILVER"));

        mockMvc.perform(get("/api/leaderboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].rank").value(1))
                .andExpect(jsonPath("$[0].username").value("new_driver"))
                .andExpect(jsonPath("$[0].totalWins").value(1));

        assertThat(gameSaveRepository.count()).isEqualTo(1);
        assertThat(leaderboardRepository.count()).isEqualTo(1);
    }

    @Test
    void ranksLowerTimesFirst() throws Exception {
        String slowerToken = register("steady_driver", "steady@example.com");
        String fasterToken = register("fast_driver", "fast@example.com");
        submitRace(slowerToken, 110_000);
        submitRace(fasterToken, 90_000);

        mockMvc.perform(get("/api/leaderboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("fast_driver"))
                .andExpect(jsonPath("$[1].username").value("steady_driver"));
    }

    private String register(String username, String email) throws Exception {
        String response = mockMvc.perform(post("/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "%s",
                                  "email": "%s",
                                  "password": "correct-horse-battery"
                                }
                                """.formatted(username, email)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return JsonPath.read(response, "$.accessToken");
    }

    private void submitRace(String token, long time) throws Exception {
        mockMvc.perform(post("/api/save")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "trackId": "green-hills",
                                  "raceTimeMs": %d
                                }
                                """.formatted(time)))
                .andExpect(status().isOk());
    }
}

package com.pulseracing.repository;

import com.pulseracing.entity.LeaderboardEntry;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface LeaderboardRepository extends JpaRepository<LeaderboardEntry, UUID> {

    Optional<LeaderboardEntry> findByUserId(UUID userId);

    @EntityGraph(attributePaths = "user")
    List<LeaderboardEntry>
            findTop20ByBestTimeMsIsNotNullOrderByBestTimeMsAscTotalWinsDesc();
}

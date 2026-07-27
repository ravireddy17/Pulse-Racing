package com.pulseracing.repository;

import com.pulseracing.entity.GameSave;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameSaveRepository extends JpaRepository<GameSave, UUID> {

    Optional<GameSave> findByUserId(UUID userId);
}

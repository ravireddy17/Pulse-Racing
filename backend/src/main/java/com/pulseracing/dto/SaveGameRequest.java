package com.pulseracing.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record SaveGameRequest(
        @NotNull @Pattern(regexp = "green-hills|desert-track") String trackId,
        @Positive @Max(3_600_000) long raceTimeMs,
        @Min(0) @Max(100) Integer masterVolume,
        Boolean reducedMotion) {
}

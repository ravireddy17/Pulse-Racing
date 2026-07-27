package com.pulseracing.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateSettingsRequest(
        @NotNull @Min(0) @Max(100) Integer masterVolume,
        @NotNull Boolean reducedMotion) {
}

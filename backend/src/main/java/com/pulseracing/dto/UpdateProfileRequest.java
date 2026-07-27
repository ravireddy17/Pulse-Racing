package com.pulseracing.dto;

import com.pulseracing.entity.CarColor;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 3, max = 30)
        @Pattern(regexp = "^[A-Za-z0-9_]+$",
                message = "must contain only letters, numbers, and underscores")
        String username,
        CarColor selectedCarColor) {
}

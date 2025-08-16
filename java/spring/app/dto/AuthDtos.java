package app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 256) String name,
        @NotBlank @Size(max = 256) String password
) {}

public record LoginRequest(
        @NotBlank String name,
        @NotBlank String password
) {}

public record TokenResponse(String token) {}

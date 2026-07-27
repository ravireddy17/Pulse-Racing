package com.pulseracing.service;

import com.pulseracing.dto.AuthResponse;
import com.pulseracing.dto.LoginRequest;
import com.pulseracing.dto.RegisterRequest;
import com.pulseracing.entity.User;
import com.pulseracing.exception.ConflictException;
import com.pulseracing.exception.InvalidCredentialsException;
import com.pulseracing.repository.UserRepository;
import com.pulseracing.security.JwtService;
import java.time.Instant;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.username().trim();
        String email = normalizeEmail(request.email());
        if (userRepository.existsByUsernameKey(username.toLowerCase(Locale.ROOT))) {
            throw new ConflictException("Username is already in use");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already in use");
        }

        User user = new User(username, email, passwordEncoder.encode(request.password()));
        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException("Username or email is already in use");
        }
        return responseFor(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        user.recordLogin(Instant.now());
        return responseFor(user);
    }

    private AuthResponse responseFor(User user) {
        JwtService.Token token = jwtService.createToken(user);
        return new AuthResponse(
                token.value(),
                "Bearer",
                token.expiresAt(),
                new AuthResponse.UserSummary(user.getId(), user.getUsername(), user.getEmail()));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

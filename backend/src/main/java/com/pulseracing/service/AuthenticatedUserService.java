package com.pulseracing.service;

import com.pulseracing.entity.User;
import com.pulseracing.exception.ResourceNotFoundException;
import com.pulseracing.repository.UserRepository;
import java.util.UUID;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService {

    private final UserRepository userRepository;

    public AuthenticatedUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireUser(Jwt jwt) {
        try {
            return userRepository.findById(UUID.fromString(jwt.getSubject()))
                    .orElseThrow(() -> new ResourceNotFoundException("User account was not found"));
        } catch (IllegalArgumentException exception) {
            throw new ResourceNotFoundException("User account was not found");
        }
    }
}

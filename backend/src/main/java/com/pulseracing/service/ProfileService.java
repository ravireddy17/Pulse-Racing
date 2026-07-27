package com.pulseracing.service;

import com.pulseracing.dto.ProfileResponse;
import com.pulseracing.dto.UpdateProfileRequest;
import com.pulseracing.entity.User;
import com.pulseracing.exception.ConflictException;
import com.pulseracing.repository.UserRepository;
import java.util.Locale;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final AuthenticatedUserService authenticatedUserService;
    private final UserRepository userRepository;

    public ProfileService(
            AuthenticatedUserService authenticatedUserService,
            UserRepository userRepository) {
        this.authenticatedUserService = authenticatedUserService;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Jwt jwt) {
        return ProfileResponse.from(authenticatedUserService.requireUser(jwt));
    }

    @Transactional
    public ProfileResponse updateProfile(Jwt jwt, UpdateProfileRequest request) {
        User user = authenticatedUserService.requireUser(jwt);
        if (request.username() != null) {
            String username = request.username().trim();
            String key = username.toLowerCase(Locale.ROOT);
            if (!key.equals(user.getUsername().toLowerCase(Locale.ROOT))
                    && userRepository.existsByUsernameKey(key)) {
                throw new ConflictException("Username is already in use");
            }
            user.updateIdentity(username);
        }
        if (request.selectedCarColor() != null) {
            user.selectCarColor(request.selectedCarColor());
        }
        return ProfileResponse.from(user);
    }
}

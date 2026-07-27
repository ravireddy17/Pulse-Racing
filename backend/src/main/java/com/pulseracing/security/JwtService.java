package com.pulseracing.security;

import com.pulseracing.dto.AuthResponse;
import com.pulseracing.entity.User;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final Duration expiration;
    private final String issuer;

    public JwtService(
            JwtEncoder jwtEncoder,
            @Value("${app.jwt.expiration}") Duration expiration,
            @Value("${app.jwt.issuer}") String issuer) {
        this.jwtEncoder = jwtEncoder;
        this.expiration = expiration;
        this.issuer = issuer;
    }

    public Token createToken(User user) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(expiration);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(user.getId().toString())
                .claim("username", user.getUsername())
                .claim("email", user.getEmail())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String value = jwtEncoder
                .encode(JwtEncoderParameters.from(header, claims))
                .getTokenValue();
        return new Token(value, expiresAt);
    }

    public record Token(String value, Instant expiresAt) {
    }
}

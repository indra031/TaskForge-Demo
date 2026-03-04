package com.taskforge.service;

import static org.assertj.core.api.Assertions.*;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import java.time.Duration;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    // A 256-bit (32-byte) secret — must be at least 32 chars for HMAC-SHA256
    private static final String SECRET =
            "a-256-bit-base64-encoded-secret-for-dev-only-change-in-prod";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(
                SECRET,
                Duration.ofMinutes(15),
                Duration.ofDays(7));
    }

    @Nested
    @DisplayName("generateAccessToken")
    class GenerateAccessToken {

        @Test
        @DisplayName("should return a non-null, non-empty token string")
        void shouldReturnNonNullNonEmptyToken() {
            // Arrange
            var userId = UUID.randomUUID();

            // Act
            var token = jwtService.generateAccessToken(userId);

            // Assert
            assertThat(token).isNotNull().isNotEmpty();
        }
    }

    @Nested
    @DisplayName("parseAccessToken")
    class ParseAccessToken {

        @Test
        @DisplayName("should extract correct userId and jti from a valid token")
        void shouldExtractCorrectUserIdAndJti() {
            // Arrange
            var userId = UUID.randomUUID();
            var token = jwtService.generateAccessToken(userId);

            // Act
            var claims = jwtService.parseAccessToken(token);

            // Assert
            assertThat(UUID.fromString(claims.getSubject())).isEqualTo(userId);
            assertThat(claims.getId()).isNotNull().isNotEmpty();
        }

        @Test
        @DisplayName("should throw ExpiredJwtException when token has already expired")
        void shouldThrowWhenTokenIsExpired() {
            // Arrange — create a JwtService with zero-second expiry so the token is instantly expired
            var expiredJwtService = new JwtService(SECRET, Duration.ofSeconds(0), Duration.ofDays(7));
            var userId = UUID.randomUUID();
            var expiredToken = expiredJwtService.generateAccessToken(userId);

            // Act & Assert
            assertThatThrownBy(() -> jwtService.parseAccessToken(expiredToken))
                    .isInstanceOf(ExpiredJwtException.class);
        }

        @Test
        @DisplayName("should throw JwtException when token signature has been tampered with")
        void shouldThrowWhenTokenIsTampered() {
            // Arrange
            var userId = UUID.randomUUID();
            var validToken = jwtService.generateAccessToken(userId);

            // Flip one character in the signature portion (last segment after the final '.')
            var lastDot = validToken.lastIndexOf('.');
            var tamperedChar = validToken.charAt(lastDot + 1) == 'A' ? 'B' : 'A';
            var tamperedToken = validToken.substring(0, lastDot + 1)
                    + tamperedChar
                    + validToken.substring(lastDot + 2);

            // Act & Assert
            assertThatThrownBy(() -> jwtService.parseAccessToken(tamperedToken))
                    .isInstanceOf(JwtException.class);
        }
    }

    @Nested
    @DisplayName("hashToken")
    class HashToken {

        @Test
        @DisplayName("should produce the same hash for the same input on repeated calls")
        void shouldBeDeterministic() {
            // Arrange
            var input = "some-refresh-token-value";

            // Act
            var firstHash = jwtService.hashToken(input);
            var secondHash = jwtService.hashToken(input);

            // Assert
            assertThat(firstHash).isEqualTo(secondHash);
        }

        @Test
        @DisplayName("should produce different hashes for different inputs")
        void shouldProduceDifferentHashesForDifferentInputs() {
            // Arrange
            var inputA = "token-value-alpha";
            var inputB = "token-value-beta";

            // Act
            var hashA = jwtService.hashToken(inputA);
            var hashB = jwtService.hashToken(inputB);

            // Assert
            assertThat(hashA).isNotEqualTo(hashB);
        }
    }

    @Nested
    @DisplayName("generateRefreshTokenValue")
    class GenerateRefreshTokenValue {

        @Test
        @DisplayName("should return a non-null, non-empty string")
        void shouldReturnNonNullNonEmptyValue() {
            // Act
            var value = jwtService.generateRefreshTokenValue();

            // Assert
            assertThat(value).isNotNull().isNotEmpty();
        }

        @Test
        @DisplayName("should return a different value on each call")
        void shouldReturnUniqueValueEachCall() {
            // Act
            var first = jwtService.generateRefreshTokenValue();
            var second = jwtService.generateRefreshTokenValue();

            // Assert
            assertThat(first).isNotEqualTo(second);
        }
    }
}

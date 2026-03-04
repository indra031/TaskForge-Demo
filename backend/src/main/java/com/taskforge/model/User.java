package com.taskforge.model;

import jakarta.persistence.*;
import java.time.Duration;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "users")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(length = 100)
    private String fullName;

    @Builder.Default
    @Column(nullable = false)
    private int failedAttemptCount = 0;

    private Instant lockedUntil;

    public boolean isLocked() {
        return lockedUntil != null && Instant.now().isBefore(lockedUntil);
    }

    public void recordFailedAttempt(int maxAttempts, Duration lockoutDuration) {
        this.failedAttemptCount++;
        if (this.failedAttemptCount >= maxAttempts) {
            lock(lockoutDuration);
        }
    }

    public void resetFailedAttempts() {
        this.failedAttemptCount = 0;
        this.lockedUntil = null;
    }

    public void lock(Duration duration) {
        this.lockedUntil = Instant.now().plus(duration);
    }
}

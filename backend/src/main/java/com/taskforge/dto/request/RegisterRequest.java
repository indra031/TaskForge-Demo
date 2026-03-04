package com.taskforge.dto.request;

import com.taskforge.validation.PasswordsMatch;
import com.taskforge.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@PasswordsMatch
public record RegisterRequest(
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @ValidPassword String password,
        @NotBlank String confirmPassword,
        @Size(max = 100) String fullName
) {
}

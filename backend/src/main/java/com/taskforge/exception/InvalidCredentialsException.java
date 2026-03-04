package com.taskforge.exception;

import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends BaseServiceException {
    public InvalidCredentialsException() {
        super("Invalid email or password", HttpStatus.UNAUTHORIZED);
    }
}

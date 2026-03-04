package com.taskforge.exception;

import org.springframework.http.HttpStatus;

public class InvalidTokenException extends BaseServiceException {
    public InvalidTokenException() {
        super("Invalid or expired token", HttpStatus.UNAUTHORIZED);
    }
}

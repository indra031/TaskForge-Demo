package com.taskforge.exception;

import org.springframework.http.HttpStatus;

public class EmailAlreadyExistsException extends BaseServiceException {
    public EmailAlreadyExistsException(String email) {
        super("Unable to register with this email", HttpStatus.CONFLICT);
    }
}

package com.taskforge.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class BaseServiceException extends RuntimeException {

    private final HttpStatus status;

    protected BaseServiceException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
}

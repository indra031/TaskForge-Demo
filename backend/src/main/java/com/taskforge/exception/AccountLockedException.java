package com.taskforge.exception;

import org.springframework.http.HttpStatus;

public class AccountLockedException extends BaseServiceException {
    public AccountLockedException() {
        super("Too many failed attempts \u2014 please try again later", HttpStatus.LOCKED);
    }
}

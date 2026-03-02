package com.taskforge.exception;

import java.util.UUID;
import org.springframework.http.HttpStatus;

public class TaskAlreadyCompletedException extends BaseServiceException {

    public TaskAlreadyCompletedException(UUID taskId) {
        super("Task " + taskId + " is already completed and cannot be modified", HttpStatus.CONFLICT);
    }
}

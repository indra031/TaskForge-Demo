package com.taskforge.exception;

import java.util.UUID;
import org.springframework.http.HttpStatus;

public class TaskNotFoundException extends BaseServiceException {

    public TaskNotFoundException(UUID taskId) {
        super("Task not found with ID: " + taskId, HttpStatus.NOT_FOUND);
    }
}

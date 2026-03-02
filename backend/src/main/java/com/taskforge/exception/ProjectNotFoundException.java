package com.taskforge.exception;

import java.util.UUID;
import org.springframework.http.HttpStatus;

public class ProjectNotFoundException extends BaseServiceException {

    public ProjectNotFoundException(UUID projectId) {
        super("Project not found with ID: " + projectId, HttpStatus.NOT_FOUND);
    }
}

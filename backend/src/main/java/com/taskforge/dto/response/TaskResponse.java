package com.taskforge.dto.response;

import com.taskforge.model.TaskPriority;
import com.taskforge.model.TaskStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        UUID projectId,
        String projectName,
        UUID assigneeId,
        LocalDate dueDate,
        Instant createdAt,
        Instant updatedAt
) {
}

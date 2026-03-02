package com.taskforge.dto.request;

import com.taskforge.model.TaskPriority;
import com.taskforge.model.TaskStatus;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateTaskRequest(
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title,

        @Size(max = 4000, message = "Description must not exceed 4000 characters")
        String description,

        TaskStatus status,

        TaskPriority priority,

        UUID assigneeId,

        LocalDate dueDate
) {
}

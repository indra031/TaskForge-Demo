package com.taskforge.dto.response;

import com.taskforge.model.TaskPriority;
import com.taskforge.model.TaskStatus;
import java.time.LocalDate;
import java.util.UUID;

public record TaskSummaryResponse(
        UUID id,
        String title,
        TaskStatus status,
        TaskPriority priority,
        String projectName,
        UUID assigneeId,
        LocalDate dueDate
) {
}

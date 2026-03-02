package com.taskforge.dto.response;

import com.taskforge.model.TaskPriority;
import com.taskforge.model.TaskStatus;
import java.util.List;
import java.util.Map;

public record TaskStatsResponse(
        Map<TaskStatus, Long> statusCounts,
        Map<TaskPriority, Long> priorityCounts,
        long totalTasks,
        List<TaskSummaryResponse> overdueTasks,
        long overdueCount
) {
}

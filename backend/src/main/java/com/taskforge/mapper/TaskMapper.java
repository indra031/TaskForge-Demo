package com.taskforge.mapper;

import com.taskforge.dto.request.CreateTaskRequest;
import com.taskforge.dto.response.TaskResponse;
import com.taskforge.dto.response.TaskSummaryResponse;
import com.taskforge.model.Task;

public interface TaskMapper {

    Task toEntity(CreateTaskRequest request);

    TaskResponse toResponse(Task task);

    TaskSummaryResponse toSummaryResponse(Task task);
}

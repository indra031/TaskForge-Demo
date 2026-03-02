package com.taskforge.mapper;

import com.taskforge.dto.request.CreateTaskRequest;
import com.taskforge.dto.response.TaskResponse;
import com.taskforge.dto.response.TaskSummaryResponse;
import com.taskforge.model.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapperImpl implements TaskMapper {

    @Override
    public Task toEntity(CreateTaskRequest request) {
        return Task.builder()
                .title(request.title())
                .description(request.description())
                .priority(request.priority())
                .assigneeId(request.assigneeId())
                .dueDate(request.dueDate())
                .build();
    }

    @Override
    public TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getProject() != null ? task.getProject().getId() : null,
                task.getProject() != null ? task.getProject().getName() : null,
                task.getAssigneeId(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }

    @Override
    public TaskSummaryResponse toSummaryResponse(Task task) {
        return new TaskSummaryResponse(
                task.getId(),
                task.getTitle(),
                task.getStatus(),
                task.getPriority(),
                task.getProject() != null ? task.getProject().getName() : null,
                task.getAssigneeId(),
                task.getDueDate()
        );
    }
}

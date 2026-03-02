package com.taskforge.service;

import com.taskforge.dto.request.CreateTaskRequest;
import com.taskforge.dto.request.UpdateTaskRequest;
import com.taskforge.dto.response.TaskResponse;
import com.taskforge.dto.response.TaskStatsResponse;
import com.taskforge.dto.response.TaskSummaryResponse;
import com.taskforge.exception.ProjectNotFoundException;
import com.taskforge.exception.TaskAlreadyCompletedException;
import com.taskforge.exception.TaskNotFoundException;
import com.taskforge.mapper.TaskMapper;
import com.taskforge.model.TaskPriority;
import com.taskforge.model.TaskStatus;
import com.taskforge.repository.ProjectRepository;
import com.taskforge.repository.TaskRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskMapper taskMapper;

    @Transactional(readOnly = true)
    public Optional<TaskResponse> findById(UUID id) {
        return taskRepository.findById(id)
                .map(taskMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<TaskSummaryResponse> findAll(TaskStatus status, UUID assigneeId, Pageable pageable) {
        return taskRepository.findByFilters(status, assigneeId, pageable)
                .map(taskMapper::toSummaryResponse);
    }

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        var project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ProjectNotFoundException(request.projectId()));

        var task = taskMapper.toEntity(request);
        task.assignToProject(project);

        if (request.priority() != null) {
            task.changePriority(request.priority());
        }

        var saved = taskRepository.save(task);
        log.info("Task {} created in project {}", saved.getId(), project.getId());

        return taskMapper.toResponse(saved);
    }

    @Transactional
    public TaskResponse updateTask(UUID id, UpdateTaskRequest request) {
        var task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));

        if (request.title() != null) {
            task.updateTitle(request.title());
        }
        if (request.description() != null) {
            task.updateDescription(request.description());
        }
        if (request.status() != null) {
            task.changeStatus(request.status());
        }
        if (request.priority() != null) {
            task.changePriority(request.priority());
        }
        if (request.assigneeId() != null) {
            task.assignTo(request.assigneeId());
        }
        if (request.dueDate() != null) {
            task.rescheduleDueTo(request.dueDate());
        }

        log.info("Task {} updated", id);
        return taskMapper.toResponse(task);
    }

    @Transactional
    public void deleteTask(UUID id) {
        var task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
        taskRepository.delete(task);
        log.info("Task {} deleted", id);
    }

    @Transactional(readOnly = true)
    public TaskStatsResponse getStats() {
        Map<TaskStatus, Long> statusCounts = taskRepository.countGroupedByStatus()
                .stream()
                .collect(Collectors.toMap(r -> r.getStatus(), r -> r.getCount(),
                        (a, b) -> b, () -> new EnumMap<>(TaskStatus.class)));
        Arrays.stream(TaskStatus.values()).forEach(s -> statusCounts.putIfAbsent(s, 0L));

        Map<TaskPriority, Long> priorityCounts = taskRepository.countGroupedByPriority()
                .stream()
                .collect(Collectors.toMap(r -> r.getPriority(), r -> r.getCount(),
                        (a, b) -> b, () -> new EnumMap<>(TaskPriority.class)));
        Arrays.stream(TaskPriority.values()).forEach(p -> priorityCounts.putIfAbsent(p, 0L));

        long totalTasks = statusCounts.values().stream().mapToLong(Long::longValue).sum();

        var today = LocalDate.now();
        var overduePageable = PageRequest.of(0, 50, Sort.by("dueDate").ascending());
        var overdueTasks = taskRepository.findOverdueTasks(today, overduePageable)
                .getContent()
                .stream()
                .map(taskMapper::toSummaryResponse)
                .toList();

        long overdueCount = taskRepository.countOverdueTasks(today);

        log.info("Task stats retrieved: {} total, {} overdue", totalTasks, overdueCount);

        return new TaskStatsResponse(statusCounts, priorityCounts, totalTasks, overdueTasks, overdueCount);
    }

    @Transactional
    public TaskResponse assignTask(UUID taskId, UUID assigneeId) {
        var task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));

        if (task.getStatus() == TaskStatus.DONE) {
            throw new TaskAlreadyCompletedException(taskId);
        }

        task.assignTo(assigneeId);
        log.info("Task {} assigned to user {}", taskId, assigneeId);

        return taskMapper.toResponse(task);
    }
}

package com.taskforge.controller;

import com.taskforge.dto.request.CreateTaskRequest;
import com.taskforge.dto.request.UpdateTaskRequest;
import com.taskforge.dto.response.TaskResponse;
import com.taskforge.dto.response.TaskStatsResponse;
import com.taskforge.dto.response.TaskSummaryResponse;
import com.taskforge.exception.TaskNotFoundException;
import com.taskforge.model.TaskStatus;
import com.taskforge.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management operations")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @Operation(summary = "List tasks with optional filtering by status and assignee")
    public Page<TaskSummaryResponse> listTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) UUID assigneeId,
            Pageable pageable) {
        return taskService.findAll(status, assigneeId, pageable);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get task statistics for the dashboard")
    public TaskStatsResponse getTaskStats() {
        return taskService.getStats();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task details by ID")
    public TaskResponse getTask(@PathVariable UUID id) {
        return taskService.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody CreateTaskRequest request) {
        var response = taskService.createTask(request);
        var location = URI.create("/api/v1/tasks/" + response.id());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing task")
    public TaskResponse updateTask(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskRequest request) {
        return taskService.updateTask(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a task")
    public void deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
    }

    @PostMapping("/{id}/assign")
    @Operation(summary = "Assign a task to a user")
    public TaskResponse assignTask(
            @PathVariable UUID id,
            @RequestBody UUID assigneeId) {
        return taskService.assignTask(id, assigneeId);
    }
}

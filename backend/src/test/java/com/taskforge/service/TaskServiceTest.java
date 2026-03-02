package com.taskforge.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.taskforge.dto.request.CreateTaskRequest;
import com.taskforge.dto.response.TaskResponse;
import com.taskforge.exception.ProjectNotFoundException;
import com.taskforge.exception.TaskAlreadyCompletedException;
import com.taskforge.exception.TaskNotFoundException;
import com.taskforge.mapper.TaskMapper;
import com.taskforge.model.*;
import com.taskforge.repository.ProjectRepository;
import com.taskforge.repository.TaskRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private TaskMapper taskMapper;
    @InjectMocks private TaskService taskService;

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("should return task response when task exists")
        void shouldReturnTaskWhenExists() {
            // Arrange
            var taskId = UUID.randomUUID();
            var task = mock(Task.class);
            var expectedResponse = mock(TaskResponse.class);

            when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
            when(taskMapper.toResponse(task)).thenReturn(expectedResponse);

            // Act
            var result = taskService.findById(taskId);

            // Assert
            assertThat(result).isPresent().contains(expectedResponse);
        }

        @Test
        @DisplayName("should return empty when task does not exist")
        void shouldReturnEmptyWhenNotExists() {
            // Arrange
            var taskId = UUID.randomUUID();
            when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

            // Act
            var result = taskService.findById(taskId);

            // Assert
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("createTask")
    class CreateTask {

        @Test
        @DisplayName("should create task when project exists")
        void shouldCreateTaskWhenProjectExists() {
            // Arrange
            var projectId = UUID.randomUUID();
            var request = new CreateTaskRequest("Test Task", "Description", projectId, null, null, null);
            var project = mock(Project.class);
            var task = mock(Task.class);
            var savedTask = mock(Task.class);
            var expectedResponse = mock(TaskResponse.class);

            when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
            when(taskMapper.toEntity(request)).thenReturn(task);
            when(taskRepository.save(task)).thenReturn(savedTask);
            when(taskMapper.toResponse(savedTask)).thenReturn(expectedResponse);
            when(savedTask.getId()).thenReturn(UUID.randomUUID());
            when(project.getId()).thenReturn(projectId);

            // Act
            var result = taskService.createTask(request);

            // Assert
            assertThat(result).isEqualTo(expectedResponse);
            verify(task).assignToProject(project);
        }

        @Test
        @DisplayName("should throw ProjectNotFoundException when project does not exist")
        void shouldThrowWhenProjectNotFound() {
            // Arrange
            var projectId = UUID.randomUUID();
            var request = new CreateTaskRequest("Test Task", "Description", projectId, null, null, null);
            when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> taskService.createTask(request))
                    .isInstanceOf(ProjectNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("assignTask")
    class AssignTask {

        @Test
        @DisplayName("should assign task when task is not completed")
        void shouldAssignTaskWhenNotCompleted() {
            // Arrange
            var taskId = UUID.randomUUID();
            var assigneeId = UUID.randomUUID();
            var task = mock(Task.class);
            var expectedResponse = mock(TaskResponse.class);

            when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
            when(task.getStatus()).thenReturn(TaskStatus.IN_PROGRESS);
            when(taskMapper.toResponse(task)).thenReturn(expectedResponse);

            // Act
            var result = taskService.assignTask(taskId, assigneeId);

            // Assert
            assertThat(result).isEqualTo(expectedResponse);
            verify(task).assignTo(assigneeId);
        }

        @Test
        @DisplayName("should throw TaskAlreadyCompletedException when task is done")
        void shouldThrowWhenTaskCompleted() {
            // Arrange
            var taskId = UUID.randomUUID();
            var assigneeId = UUID.randomUUID();
            var task = mock(Task.class);

            when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
            when(task.getStatus()).thenReturn(TaskStatus.DONE);

            // Act & Assert
            assertThatThrownBy(() -> taskService.assignTask(taskId, assigneeId))
                    .isInstanceOf(TaskAlreadyCompletedException.class);
        }

        @Test
        @DisplayName("should throw TaskNotFoundException when task does not exist")
        void shouldThrowWhenTaskNotFound() {
            // Arrange
            var taskId = UUID.randomUUID();
            var assigneeId = UUID.randomUUID();
            when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> taskService.assignTask(taskId, assigneeId))
                    .isInstanceOf(TaskNotFoundException.class);
        }
    }
}

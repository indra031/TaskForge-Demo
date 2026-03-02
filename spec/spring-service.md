# How We Write Spring Services

## Structure
- Package: `com.taskforge.service`
- Class name: `<Domain>Service` (e.g., `TaskService`, `ProjectService`)
- Annotated with `@Service` and `@RequiredArgsConstructor`
- Constructor injection only — never `@Autowired` on fields
- Use `@Transactional` at method level, not class level

## Method Conventions
- Public methods represent business operations, not CRUD
  - Good: `assignTask(UUID taskId, UUID assigneeId)`, `completeTask(UUID taskId)`
  - Bad: `save(Task task)`, `update(Task task)`
- Return `Optional<T>` for single-entity lookups, never null
- Throw domain-specific exceptions (extend `BaseServiceException`)
- Accept command/query objects for methods with 3+ parameters

## Validation
- Use Jakarta Bean Validation on command objects (`@NotNull`, `@NotBlank`, `@Size`, etc.)
- Business rule validation inside the service method, before persistence
- Return meaningful error messages referencing field names

## Logging
- Use `@Slf4j` (Lombok)
- INFO: successful business operations with entity ID
  - `log.info("Task {} assigned to user {}", taskId, assigneeId);`
- WARN: recoverable issues (retry, fallback)
  - `log.warn("Notification delivery failed for task {}, will retry", taskId);`
- ERROR: unrecoverable failures with exception and context
  - `log.error("Failed to process payment for order {}", orderId, exception);`

## Testing
- Unit tests for every public method
- Mock dependencies with Mockito — never load Spring context for unit tests
- Test both happy path and error scenarios
- Use Arrange-Act-Assert pattern with `@DisplayName`

## Example

```java
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
    public TaskResponse assignTask(UUID taskId, UUID assigneeId) {
        var task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));

        // Business rule: cannot assign completed tasks
        if (task.getStatus() == TaskStatus.DONE) {
            throw new TaskAlreadyCompletedException(taskId);
        }

        task.assignTo(assigneeId);
        log.info("Task {} assigned to user {}", taskId, assigneeId);

        return taskMapper.toResponse(task);
    }
}
```

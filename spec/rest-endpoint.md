# How We Write REST Endpoints

## Structure
- Package: `com.taskforge.controller`
- Class name: `<Domain>Controller`
- Annotated with `@RestController` and `@RequestMapping("/api/v1/<resource>")`
- Inject service layer only — controllers must not access repositories

## Request Handling
- Use `@Valid` on all request body parameters
- DTOs for request/response — never expose domain entities
- Use records for request/response DTOs
- Include `@Operation` annotations for OpenAPI documentation

## Response Conventions
- `GET /resources` → `Page<SummaryResponse>` (paginated list)
- `GET /resources/{id}` → `Response` (full detail) or 404
- `POST /resources` → 201 Created with `Location` header and `Response` body
- `PUT /resources/{id}` → 200 OK with updated `Response`
- `DELETE /resources/{id}` → 204 No Content

## Error Responses
- All errors follow RFC 9457 Problem Detail format
- Handled by `GlobalExceptionHandler` — not in individual controllers
- Never expose internal details (stack traces, SQL, class names)

## Example

```java
@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management operations")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @Operation(summary = "List tasks with pagination and filtering")
    public Page<TaskSummaryResponse> listTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) UUID assigneeId,
            Pageable pageable) {
        return taskService.findAll(status, assigneeId, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task details by ID")
    public TaskResponse getTask(@PathVariable UUID id) {
        return taskService.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new task")
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody CreateTaskRequest request) {
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
            @Valid @RequestBody AssignTaskRequest request) {
        return taskService.assignTask(id, request.assigneeId());
    }
}
```

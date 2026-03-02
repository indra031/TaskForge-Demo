# Feature Spec: Task Statistics Service

## Goal

Provide aggregated statistics for tasks within a project: counts by status,
average completion time, and overdue task identification.

## Requirements

1. **TaskStatisticsService** with method `getStatsByProject(Long projectId)`
2. Returns **TaskStatisticsDTO** (Java record) containing:
   - `totalTasks` (int) — total task count for the project
   - `completedTasks` (int) — tasks with status DONE
   - `inProgressTasks` (int) — tasks with status IN_PROGRESS
   - `overdueTasks` (int) — tasks past their due date and not DONE
   - `averageCompletionTimeHours` (double) — average hours from creation to completion
3. **Caching:** Results cached for 5 minutes using Spring `@Cacheable("taskStats")`
4. **REST Endpoint:** `GET /api/v1/projects/{projectId}/statistics`
   - Returns 200 with TaskStatisticsDTO as JSON
   - Returns 404 if project does not exist

## Constraints

- Follow `spec/spring-service.md` conventions (constructor injection, @Transactional)
- Read-only service — no writes to database
- Use existing `TaskRepository` queries where possible; add new @Query methods if needed
- Cache eviction: evict on any task create/update/delete in the same project
- Error handling: throw `ProjectNotFoundException` if project ID invalid

## Technical Notes

- Use `Duration.between(task.getCreatedAt(), task.getCompletedAt())` for completion time
- Overdue = `task.getDueDate().isBefore(LocalDate.now()) && task.getStatus() != DONE`
- Handle division by zero for averageCompletionTimeHours (return 0.0 if no completed tasks)

## Acceptance Criteria

- [ ] Unit tests with >80% branch coverage on service methods
- [ ] Integration test verifying cache behavior (second call doesn't hit DB)
- [ ] `mvn compile` passes clean
- [ ] `mvn test` passes clean
- [ ] DTO is a Java record (not a class)
- [ ] No field injection anywhere

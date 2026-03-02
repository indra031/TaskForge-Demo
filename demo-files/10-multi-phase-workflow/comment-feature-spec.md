# Feature Spec: Task Comments

## Goal

Add a comment system to tasks — users can post, edit, and delete comments
on any task they have access to. Comments support plain text only (no
attachments in Phase 1).

## Phase 1 — Data Layer

### Deliverables
1. **Entity:** `Comment` JPA entity in `com.taskforge.comment.entity`
   - `id` (Long, generated)
   - `taskId` (Long, FK → Task)
   - `authorId` (Long, FK → User)
   - `content` (String, max 2000 chars, not blank)
   - `createdAt` (LocalDateTime, auto-set)
   - `updatedAt` (LocalDateTime, auto-set on change)
2. **Repository:** `CommentRepository` extending `JpaRepository<Comment, Long>`
   - `List<Comment> findByTaskIdOrderByCreatedAtDesc(Long taskId)`
   - `int countByTaskId(Long taskId)`
   - `@Modifying deleteByTaskId(Long taskId)` — for cascade cleanup
3. **Migration:** Flyway script `V20260301__create_comment_table.sql`
   - Table `comments` with proper FK constraints and indexes on `task_id`
4. **DTO:** `CommentDTO` Java record with all fields except `authorId` → replaced by `authorName`

### Acceptance Criteria — Phase 1
- [ ] `mvn compile` passes
- [ ] Entity unit test validates constraints (blank content, max length)
- [ ] Repository integration test with `@DataJpaTest`
- [ ] Migration runs clean on H2 (test) and PostgreSQL (local dev)

### SCRATCHPAD Checkpoint
After Phase 1, write SCRATCHPAD.md with:
- Files created, test results, any schema decisions made
- Note which repository methods were tested

---

## Phase 2 — Service + API Layer

### Prerequisites
Read SCRATCHPAD.md from Phase 1. Verify all Phase 1 criteria pass.

### Deliverables
1. **Service:** `CommentService` in `com.taskforge.comment.service`
   - `List<CommentDTO> getComments(Long taskId)` — read-only, paginated later
   - `CommentDTO addComment(Long taskId, Long authorId, String content)`
   - `CommentDTO updateComment(Long commentId, Long requesterId, String newContent)`
   - `void deleteComment(Long commentId, Long requesterId)`
   - Authorization: only the author can edit/delete their own comments
2. **Controller:** `CommentController` with REST endpoints
   - `GET /api/v1/tasks/{taskId}/comments` → 200 with list
   - `POST /api/v1/tasks/{taskId}/comments` → 201 with created comment
   - `PUT /api/v1/comments/{commentId}` → 200 with updated comment
   - `DELETE /api/v1/comments/{commentId}` → 204 no content
3. **Exception Handling:**
   - `CommentNotFoundException` → 404
   - `UnauthorizedCommentAccessException` → 403
4. **Tests:**
   - Unit tests for service (mock repository)
   - Integration tests for controller (`@WebMvcTest`)

### Constraints (Both Phases)
- Follow `spec/spring-service.md` conventions
- Constructor injection only (Lombok `@RequiredArgsConstructor`)
- `@Transactional` on all service write methods
- `@Transactional(readOnly = true)` on read methods
- Cache: no caching in Phase 1 (add in future phase)

### Acceptance Criteria — Phase 2
- [ ] All Phase 1 tests still pass
- [ ] Service unit tests: >80% branch coverage
- [ ] Controller integration tests cover all 4 endpoints + error cases
- [ ] `mvn verify` passes clean
- [ ] No field injection anywhere

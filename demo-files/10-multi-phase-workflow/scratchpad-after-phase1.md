# SCRATCHPAD.md — Task Comments Phase 1

## Completed
- Comment JPA entity with validation constraints
- CommentRepository with three query methods
- Flyway migration V20260301__create_comment_table.sql
- CommentDTO Java record
- Entity validation unit tests
- Repository integration tests with @DataJpaTest

## Key Decisions
- Used @EntityListeners(AuditingEntityListener.class) for createdAt/updatedAt auto-population
  instead of @PrePersist/@PreUpdate — consistent with existing TaskForge entities
- Kept authorId as Long FK rather than @ManyToOne to User entity — the spec says
  "plain text only" and we want to avoid loading the full User graph on comment reads
- Added a composite index on (task_id, created_at DESC) in the migration for efficient
  ordered retrieval — the primary query pattern is "newest comments first per task"
- CommentDTO uses authorName (String) instead of authorId — the service layer will resolve
  this via UserRepository.findNameById() in Phase 2

## Files Created / Modified
- `backend/src/main/java/com/taskforge/comment/entity/Comment.java` — JPA entity
- `backend/src/main/java/com/taskforge/comment/repository/CommentRepository.java` — Spring Data repo
- `backend/src/main/java/com/taskforge/comment/dto/CommentDTO.java` — Java record DTO
- `backend/src/main/resources/db/migration/V20260301__create_comment_table.sql` — Flyway migration
- `backend/src/test/java/com/taskforge/comment/entity/CommentValidationTest.java` — Bean validation tests
- `backend/src/test/java/com/taskforge/comment/repository/CommentRepositoryTest.java` — @DataJpaTest integration tests

## Current State
- Tests passing: yes (8 tests — 3 validation, 5 repository)
- Build status: compiles clean (mvn compile → BUILD SUCCESS)
- Coverage: not measured yet (will measure after Phase 2 adds service tests)

## Remaining Work
- [ ] CommentService with CRUD + authorization logic
- [ ] CommentController with REST endpoints
- [ ] Custom exceptions (CommentNotFoundException, UnauthorizedCommentAccessException)
- [ ] Service unit tests (mock repository)
- [ ] Controller integration tests (@WebMvcTest)
- [ ] Measure and verify >80% branch coverage on service

## Open Questions / Blockers
- UserRepository.findNameById() does not exist yet — Phase 2 will need to add this
  query method or use the existing findById() and map to name in the service
- Pagination not in Phase 2 scope but the query method returns List — may want to
  switch to Page<Comment> in a future phase

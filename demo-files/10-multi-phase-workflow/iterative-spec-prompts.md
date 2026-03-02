# Mode B: Iterative Spec Generation — Task Comments (Multi-Phase)

> **Goal:** Starting from a business requirement, iteratively refine it into a multi-phase technical spec (`comment-feature-spec.md`). This process adds a second dimension — refining not only *what* to build, but also decomposing *how* to build it into phases with explicit boundaries and handoffs.

---

## Round 1 — From Business Requirement to Feature Outline

**Prompt:**

```
Read demo-files/10-multi-phase-workflow/business-requirement.md and
demo-files/09-spec-driven-dev/spring-service-spec.md (our conventions).

This feature is too large for a single agent session. I want to split
it into phases. Propose:
1. A high-level goal (one paragraph)
2. A phase breakdown — what goes in each phase and why
3. What the handoff between phases looks like

Don't write the full spec yet. Just the outline.
```

**What to expect:** The agent proposes 2–3 phases. Typically: Phase 1 = data
layer (entity, repository, migration), Phase 2 = service + API. It might
propose a Phase 3 for authorization or caching — that can be scoped out.

**Key insight:** Decomposition is a design decision. The agent provides options, but you decide where phase boundaries go based on team review process and risk tolerance.

---

## Round 2 — Define Phase 1 Precisely

**Prompt:**

```
Good outline. Let's keep it to 2 phases:
- Phase 1: Data layer (entity, repository, migration, DTO)
- Phase 2: Service + REST API + tests

Now flesh out Phase 1 with:
- Entity: Comment in com.taskforge.comment.entity
  Fields: id (Long), taskId (Long, FK), authorId (Long, FK),
  content (String, max 2000, not blank), createdAt, updatedAt
- Repository: CommentRepository extending JpaRepository
  Methods: findByTaskIdOrderByCreatedAtDesc, countByTaskId,
  deleteByTaskId (for cascade cleanup)
- Migration: Flyway V20260301__create_comment_table.sql
  with FK constraints and index on task_id
- DTO: CommentDTO as Java record — all fields but replace
  authorId with authorName (String)

Phase 1 acceptance criteria:
- mvn compile passes
- Entity unit test validates constraints
- Repository integration test with @DataJpaTest
- Migration runs on H2 and PostgreSQL

Also add a SCRATCHPAD checkpoint: after Phase 1, write
SCRATCHPAD.md with files created, test results, schema decisions.
```

**What to expect:** Phase 1 becomes concrete and testable. The agent has
enough detail to implement without guessing.

**Key insight:** The explicit SCRATCHPAD checkpoint serves as the handoff artifact between phases, replacing conversation context with written context.

---

## Round 3 — Define Phase 2 and Cross-Phase Constraints

**Prompt:**

```
Now flesh out Phase 2. Prerequisites: read SCRATCHPAD from Phase 1,
verify all Phase 1 criteria pass.

Phase 2 deliverables:
- CommentService with: getComments, addComment, updateComment,
  deleteComment. Authorization: only the author can edit/delete.
- CommentController with REST endpoints:
  GET /api/v1/tasks/{taskId}/comments → 200
  POST /api/v1/tasks/{taskId}/comments → 201
  PUT /api/v1/comments/{commentId} → 200
  DELETE /api/v1/comments/{commentId} → 204
- Exceptions: CommentNotFoundException (404),
  UnauthorizedCommentAccessException (403)
- Tests: unit tests for service, integration tests with @WebMvcTest

Phase 2 acceptance criteria:
- All Phase 1 tests still pass
- Service unit tests >80% branch coverage
- Controller tests cover all 4 endpoints + error cases
- mvn verify passes clean

Cross-phase constraints:
- Constructor injection only (@RequiredArgsConstructor)
- @Transactional on writes, @Transactional(readOnly=true) on reads
- No caching in this version (future phase)
- No field injection anywhere
```

**What to expect:** The full multi-phase spec is now complete.

**Key insight:** Progressive specification building. Round 1 defined structure, Round 2 added Phase 1 detail, Round 3 adds Phase 2 detail plus cross-cutting constraints.

---

## Round 4 — Validate and Finalize

**Prompt:**

```
Review the complete spec. Check:
1. Are phase boundaries clean? Can Phase 1 be implemented and
   tested independently?
2. Are acceptance criteria measurable and automatable?
3. Does anything contradict spring-service-spec.md conventions?
4. Is the SCRATCHPAD checkpoint clear enough for a fresh session
   to pick up Phase 2?

If it looks complete, save as spec/comment-feature-spec.md.
```

**What to expect:** The agent may flag minor issues (missing pagination note,
or suggesting @CreatedDate/@LastModifiedDate annotations). It finalizes.

**Key insight:** Four focused rounds build a complete multi-phase specification with session boundaries and handoff artifacts. Every round replaced ambiguity with precision.

---

## Next Steps

The complete multi-phase spec is now ready. The execution is identical to Mode A in the main demo: Phase 1 in a fresh session → scratchpad checkpoint → Phase 2 in a fresh session. The key difference is that the spec itself was co-authored through iterative refinement rather than written upfront.

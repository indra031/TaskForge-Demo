# Mode B: Iterative Spec Generation — Task Statistics

> **Goal:** This process demonstrates context engineering in action. Starting from a business requirement, each round adds precise technical context to replace business ambiguity, building toward a complete technical spec (`task-statistics-spec.md`).

---

## Round 1 — From Business Requirement to First Draft

**Prompt:**

```
Read demo-files/09-spec-driven-dev/business-requirement.md and
demo-files/09-spec-driven-dev/spring-service-spec.md (our project conventions).

Based on this business requirement, draft a technical spec for a
TaskStatisticsService. Follow the structure:
- Goal (one sentence)
- Requirements (numbered, specific)
- Constraints (what patterns to follow)
- Technical Notes (implementation hints)
- Acceptance Criteria (testable checkboxes)

Don't implement anything. Just produce the spec as a markdown file.
```

**What to expect:** The agent produces a reasonable first draft, but it will
likely be missing specifics — vague on caching strategy, missing error cases,
or including things we don't need yet (like historical trends).

**Key insight:** The first draft serves as a concrete starting point to critique rather than beginning from a blank page. Refinement rounds follow.

---

## Round 2 — Sharpen Requirements

**Prompt:**

```
Good start. Let me refine:

1. The DTO should be a Java record, not a class. Fields:
   totalTasks, completedTasks, inProgressTasks, overdueTasks,
   averageCompletionTimeHours (double).

2. For "overdue" — define it precisely:
   task.getDueDate().isBefore(LocalDate.now()) && status != DONE

3. For average completion time — use Duration between createdAt
   and completedAt. Handle division by zero (return 0.0).

4. REST endpoint: GET /api/v1/projects/{projectId}/statistics
   - 200 with DTO
   - 404 if project doesn't exist (throw ProjectNotFoundException)

5. Remove any requirements about historical trends or charts —
   those are out of scope for this feature.

Update the spec with these refinements.
```

**What to expect:** The spec becomes significantly tighter. Requirements become
measurable. Out-of-scope items are removed.

**Key insight:** Each refinement replaces ambiguity with a testable requirement. "Some kind of stats" became five specific DTO fields.

---

## Round 3 — Add Constraints and Caching

**Prompt:**

```
Two more things:

1. Caching: stakeholders said "a few minutes stale is fine."
   Use Spring @Cacheable("taskStats") with 5-minute TTL.
   Cache must be evicted on any task create/update/delete in
   the same project.

2. Constraints: this is a read-only service. No writes to the
   database. Use existing TaskRepository queries where possible,
   add new @Query methods only if needed.

3. Make sure acceptance criteria include:
   - Unit tests with >80% branch coverage
   - Integration test verifying cache (second call doesn't hit DB)
   - mvn compile and mvn test pass clean
   - No field injection anywhere

Update the spec.
```

**What to expect:** The spec should now closely match `task-statistics-spec.md`.

**Key insight:** Three focused rounds progressively replace business ambiguity with precise, implementable requirements.

---

## Round 4 — Validate and Finalize

**Prompt:**

```
Final review. Compare this spec against our conventions in
spring-service-spec.md. Is anything missing or contradictory?

If it looks complete, save it as spec/task-statistics-spec.md.
```

**What to expect:** The agent may catch minor gaps (missing a config key for
cache TTL, or a note about transaction isolation). It finalizes and saves.

**Key insight:** The agent serves as a reviewer of its own output against known conventions. This pattern—generate → refine → validate—ensures specs align with project standards.

---

## Next Steps

The complete spec is now ready. From here, the flow is identical to Mode A in the main demo — feed the spec to the agent, review its plan, let it implement, and verify against the acceptance criteria. The key difference is that the spec itself was co-authored through iterative refinement rather than written upfront.

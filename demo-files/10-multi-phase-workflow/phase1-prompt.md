# Phase 1 Prompt — Data Layer

Use this prompt to kick off Phase 1 of the Comment feature implementation.

---

```
Read the feature spec at demo-files/10-multi-phase-workflow/comment-feature-spec.md
and the Spring service conventions at demo-files/09-spec-driven-dev/spring-service-spec.md.

Implement Phase 1 (Data Layer) only:
1. Comment entity with JPA annotations and validation constraints
2. CommentRepository with the three query methods specified
3. Flyway migration V20260301__create_comment_table.sql
4. CommentDTO as a Java record
5. Unit tests for entity validation
6. Integration test for repository with @DataJpaTest

After all tests pass, write SCRATCHPAD.md to the project root using the template
in demo-files/08-context-management/scratchpad-template.md.

Do NOT start Phase 2.
```

---

## Teaching Points

→ The prompt explicitly says "Phase 1 only" and "Do NOT start Phase 2."
  Without these boundaries, the agent would implement everything at once.

→ The prompt references two spec files — the feature spec AND the conventions spec.
  This gives the agent all the context it needs without us pasting content inline.

→ The SCRATCHPAD step at the end creates a checkpoint for Phase 2 to pick up from.
  This is the bridge between phases — it captures decisions and state.

→ Notice we reference file paths, not paste content. The agent reads what it needs.
  This keeps the prompt small and the context budget available for implementation.

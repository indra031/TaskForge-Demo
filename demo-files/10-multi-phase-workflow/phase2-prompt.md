# Phase 2 Prompt — Service + API Layer

Use this prompt to kick off Phase 2 after Phase 1 is complete and checkpointed.

---

```
Read SCRATCHPAD.md in the project root to understand what Phase 1 produced.
Then read the feature spec at demo-files/10-multi-phase-workflow/comment-feature-spec.md
(Phase 2 section) and the conventions at demo-files/09-spec-driven-dev/spring-service-spec.md.

Verify Phase 1 is solid: run mvn compile and mvn test. If anything fails, fix it first.

Then implement Phase 2 (Service + API Layer):
1. CommentService with all four methods specified
2. Authorization checks — only authors can edit/delete their comments
3. CommentController with REST endpoints matching the spec
4. CommentNotFoundException and UnauthorizedCommentAccessException
5. Unit tests for service (mock repository, test all paths)
6. Integration tests for controller (@WebMvcTest, test all endpoints + errors)

Run mvn verify. All tests must pass with >80% branch coverage on service methods.
Update SCRATCHPAD.md with Phase 2 results.
```

---

## Teaching Points

→ Phase 2 starts by reading SCRATCHPAD.md — the agent picks up exactly where Phase 1 left off.
  No need to re-explore the codebase. The checkpoint tells it what exists.

→ The "verify Phase 1 is solid" step is defensive. Between phases, something might have changed
  (another developer's commit, a dependency update). Always validate before building on top.

→ This prompt works in a FRESH context window. The agent that did Phase 1 might be long gone.
  All knowledge transfers through the spec + SCRATCHPAD, not through conversation history.

→ The coverage requirement (>80%) gives the agent a measurable acceptance criterion.
  Without it, agents tend to write happy-path-only tests.

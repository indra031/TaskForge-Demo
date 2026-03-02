# Code Review

Review the changes on the current branch compared to `main`. Perform a thorough review covering:

## Review Checklist

1. **Correctness** — Logic errors, unhandled edge cases, off-by-one errors, null safety
2. **Architecture** — Changes follow the project's layered architecture (controller → service → repository). No layer violations.
3. **Conventions** — Code follows the rules in `.claude/rules/`. Check naming, patterns, annotations.
4. **Security** — No injection vulnerabilities, unvalidated input, exposed secrets, or missing authorization checks
5. **Performance** — No N+1 queries, missing indexes for new query patterns, unnecessary eager loading
6. **Testing** — New code has corresponding tests. Tests cover happy path AND error scenarios. No tests that just confirm the implementation exists.
7. **API Design** — REST endpoints follow `spec/rest-endpoint.md`. DTOs are records. Status codes are correct.
8. **Database** — New Flyway migrations are additive (no modifying existing ones). Schema changes have corresponding entity updates.

## Output Format

For each finding, state:
- **File and line** — Where the issue is
- **Severity** — 🔴 Must fix | 🟡 Should fix | 🔵 Consider
- **Issue** — What's wrong
- **Suggestion** — How to fix it

End with a summary: total findings by severity, overall assessment (approve / request changes), and any positive observations.

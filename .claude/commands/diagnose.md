Analyze the service class: $ARGUMENTS

## What to Check

1. Read the service class and its corresponding test class
2. Read `.claude/rules/java-conventions.md` for expected conventions

## Convention Compliance

Check every method in the service against our conventions:
- `@Transactional` at method level (not class level), with `readOnly = true` for queries
- Constructor injection via `@RequiredArgsConstructor` — no `@Autowired`
- `Optional<T>` return for single-entity lookups — no null returns
- Domain exceptions (extending `BaseServiceException`) — no generic Exception catches
- `@Slf4j` logging: INFO for mutations, no logging of sensitive data

## Test Coverage Analysis

For each public method, verify:
- At least one happy-path test exists
- At least one error/edge-case test exists (not found, invalid input, etc.)
- Tests use `@DisplayName` and Arrange-Act-Assert pattern
- List any public methods that are NOT tested

## Output

Report as a table:
| Method | Conventions | Tests | Issues |
|--------|------------|-------|--------|

Then list any missing tests with a brief description of what each test should verify.

# Spring Service Specification — TaskForge Conventions

> This is the template spec. All Spring services in TaskForge must follow
> these conventions. Reference this spec when implementing any new service.

## Naming

- Class: `{Feature}Service` suffix required
- Package: `com.taskforge.{domain}.service`
- Example: `com.taskforge.statistics.service.TaskStatisticsService`

## Dependencies

- Use constructor injection (`@RequiredArgsConstructor` from Lombok)
- No `@Autowired` fields — ever
- All dependencies must be `final`
- Prefer interface types for dependencies (e.g., `TaskRepository` not `TaskRepositoryImpl`)

## Error Handling

- Throw domain-specific exceptions extending `BaseServiceException`
- Log all errors at ERROR level with meaningful context (include IDs, operation name)
- Return user-friendly error messages via REST layer (not service layer)
- Never catch and swallow exceptions silently

## Transactions

- Mark public methods with `@Transactional` (default: `REQUIRED`)
- Override to `REQUIRES_NEW` if isolation needed
- Read-only methods: `@Transactional(readOnly = true)`
- No nested transactions without explicit testing

## Testing

- Minimum 80% line coverage
- Use `@ExtendWith(MockitoExtension.class)` for unit tests
- Mock all external dependencies (repositories, clients, adapters)
- Test: happy path, error paths, edge cases, null/empty inputs
- Use AssertJ assertions: `assertThat(result).isNotNull()`

## Async Operations

- Use `TaskQueueClient`, never `CompletableFuture`
- All async tasks must be idempotent
- Log task enqueue event and result

## Configuration

- No hardcoded values — use `@Value("${config.key}")` or `@ConfigurationProperties`
- Provide sensible defaults where possible
- Document all config keys in the module README

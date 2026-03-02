---
description: Java and Spring Boot conventions for the TaskForge backend
paths:
  - "backend/**/*.java"
---

# Java Conventions

## Dependency Injection
- Constructor injection ONLY — never use `@Autowired` on fields
- Use `@RequiredArgsConstructor` (Lombok) for automatic constructor generation
- Mark injected fields as `private final`

## Services
- Annotate with `@Service` and `@RequiredArgsConstructor`
- `@Transactional` at method level, never class level
- Return `Optional<T>` for single-entity lookups — never return null
- Throw domain-specific exceptions (extend `BaseServiceException`)
- Use command/query objects for methods with 3+ parameters

## Controllers
- `@RestController` with `@RequestMapping("/api/v1/<resource>")`
- Inject service layer only — controllers must NOT access repositories directly
- Use `@Valid` on all request body parameters
- DTOs as Java records for request and response — never expose JPA entities
- Include `@Operation` annotations for OpenAPI documentation

## Entities
- Use `@Getter`, `@SuperBuilder`, `@NoArgsConstructor(access = PROTECTED)`, `@AllArgsConstructor(access = PRIVATE)` — never `@Data`
- No public setters — use named domain methods (e.g., `assignTo()`, `changeStatus()`, `updateTitle()`)
- UUID primary keys: `@Id @GeneratedValue(strategy = GenerationType.UUID)`
- Audit fields via `@MappedSuperclass` BaseEntity: `createdAt`, `updatedAt`, `createdBy`
- Extend `BaseEntity` for all entities — use `@SuperBuilder` (not `@Builder`) for inheritance

## Testing
- JUnit 5 with `@DisplayName` on every test method
- Arrange-Act-Assert pattern
- Mock dependencies with Mockito — no Spring context for unit tests
- Testcontainers with `@ServiceConnection` for integration tests
- Test both happy path and error scenarios

## Logging
- Use `@Slf4j` (Lombok)
- INFO: successful business operations with entity ID
- WARN: recoverable issues (retry, fallback)
- ERROR: unrecoverable failures with full exception and context

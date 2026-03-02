# TaskForge Backend — Module Memory

## This Module

Spring Boot 4.0.3 REST API serving the TaskForge frontend. Java 25 with virtual threads enabled.

## Package Structure

All code lives under `com.taskforge`:

| Package | Purpose | Key Rule |
|---------|---------|----------|
| `controller` | REST endpoints | Never inject repositories — service layer only |
| `service` | Business logic | `@Transactional` at method level, not class level |
| `repository` | Data access | Spring Data JPA interfaces, custom queries via `@Query` |
| `model` | JPA entities | Domain methods (no public setters), `@SuperBuilder` pattern via Lombok |
| `dto.request` | Incoming DTOs | Java records with Jakarta validation annotations |
| `dto.response` | Outgoing DTOs | Java records, constructed via hand-written mappers |
| `mapper` | Entity ↔ DTO | Interface + `@Component` implementation class |
| `exception` | Error handling | All extend `BaseServiceException`, caught by `GlobalExceptionHandler` |
| `config` | Configuration | Security, CORS, OpenAPI, virtual threads |

## Conventions

- Use `@Slf4j` (Lombok) for logging — INFO for business ops, WARN for recoverable issues, ERROR for failures
- Return `Optional<T>` for single-entity lookups, never return null
- Use `@DisplayName` on all test methods with Arrange-Act-Assert pattern
- Use Testcontainers with `@ServiceConnection` for integration tests
- All IDs are UUID, stored as `uuid` in PostgreSQL

## Dependencies Not to Add

- Hibernate Envers (not needed for this project)
- Spring WebFlux (we use virtual threads instead of reactive)
- Lombok `@Data` (use `@Getter`, `@SuperBuilder`, `@NoArgsConstructor(access = PROTECTED)`, `@AllArgsConstructor(access = PRIVATE)` explicitly)

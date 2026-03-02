---
description: Generates a complete Spring service with entity, DTO, mapper, repository, controller, exception, and tests following TaskForge conventions
triggers:
  - generate spring service
  - create service for
  - scaffold service
  - new service
---

# Spring Service Generator

You are generating a new Spring service component for the TaskForge project. Follow every convention exactly.

## Before You Start

1. Read `spec/spring-service.md` for service conventions
2. Read `spec/rest-endpoint.md` for controller conventions
3. Read `.claude/rules/java-conventions.md` for coding standards
4. Read `.claude/rules/api-design.md` for API design rules
5. Ask the user for:
   - **Domain name** (e.g., "Task", "Project", "Comment")
   - **Fields** with types and constraints
   - **Business operations** (not just CRUD — what does this service *do*?)
   - **Relationships** to other entities (if any)

## Generation Order

Generate files in this exact order, running `mvn compile -q` after each group:

### Group 1 — Domain Model
1. `model/<Domain>.java` — JPA entity extending `BaseEntity`
2. `dto/request/Create<Domain>Request.java` — Java record with Jakarta validation
3. `dto/request/Update<Domain>Request.java` — Java record with Jakarta validation
4. `dto/response/<Domain>Response.java` — Java record
5. `dto/response/<Domain>SummaryResponse.java` — Java record (for list endpoints)
6. `mapper/<Domain>Mapper.java` — mapper interface
7. `mapper/<Domain>MapperImpl.java` — `@Component` implementation

### Group 2 — Data Access
7. `repository/<Domain>Repository.java` — Spring Data JPA interface
8. `exception/<Domain>NotFoundException.java` — extends `BaseServiceException`

### Group 3 — Business Logic
9. `service/<Domain>Service.java` — Business operations with `@Transactional`

### Group 4 — API Layer
10. `controller/<Domain>Controller.java` — REST endpoints with OpenAPI annotations

### Group 5 — Tests
11. `test/.../service/<Domain>ServiceTest.java` — Unit tests with Mockito
12. `test/.../controller/<Domain>ControllerTest.java` — `@WebMvcTest` slice tests

### Group 6 — Database
13. `resources/db/migration/V<next>__create_<domain>_table.sql` — Flyway migration

## Quality Checks

After generation:
- Run `mvn compile -q` — must pass with zero errors
- Run `mvn test -q` — all generated tests must pass
- Run `mvn spotless:check -q` — formatting must be clean
- Verify mapper correctly converts between entity and DTOs

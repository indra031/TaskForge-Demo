---
description: REST API design rules for TaskForge
paths:
  - "backend/src/main/java/com/taskforge/controller/**/*.java"
  - "backend/src/main/java/com/taskforge/dto/**/*.java"
---

# API Design Rules

## URL Structure
- All endpoints under `/api/v1/`
- Use plural nouns for resources: `/api/v1/tasks`, `/api/v1/projects`
- Use kebab-case for multi-word paths: `/api/v1/task-comments`
- Nest sub-resources max one level: `/api/v1/projects/{id}/tasks`

## Request/Response
- DTOs are Java records — immutable by design
- Request DTOs: `Create<Entity>Request`, `Update<Entity>Request`
- Response DTOs: `<Entity>Response`, `<Entity>SummaryResponse` (for lists)
- Use `@Valid` on all `@RequestBody` parameters
- Pagination via `Pageable` — return `Page<T>` responses

## HTTP Methods & Status Codes
- `GET` → 200 (OK) or 404 (Not Found)
- `POST` → 201 (Created) with `Location` header
- `PUT` → 200 (OK) with updated resource
- `DELETE` → 204 (No Content)
- Validation errors → 400 (Bad Request)
- Business rule violations → 409 (Conflict) or 422 (Unprocessable Entity)

## Error Handling
- ALL error responses follow RFC 9457 Problem Detail format
- Handled by `GlobalExceptionHandler` (`@RestControllerAdvice`)
- Never expose stack traces, internal class names, or SQL errors to clients
- Include correlation ID in error responses for tracing

## Security
- JWT Bearer token in `Authorization` header
- Role-based access: `@PreAuthorize("hasRole('...')")` on controller methods
- Never include sensitive data in URL parameters

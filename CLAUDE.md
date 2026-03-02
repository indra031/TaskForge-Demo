# TaskForge — Project Memory

## Overview

TaskForge is a task management system built as a monorepo with a Spring Boot 4.0.3 backend and an Angular 21 frontend. It is used as a training demo project for agentic coding workflows.

## Stack

- **Backend:** Java 25, Spring Boot 4.0.3, Spring Data JPA, PostgreSQL 16, Flyway 10
- **Frontend:** Angular 21, TypeScript 5.9, Angular Material 21, Tailwind CSS 4, NgRx Signal Store
- **Build:** Maven 3.9+ (backend), Angular CLI 21 (frontend), Node 22 LTS
- **Testing:** JUnit 5, Mockito 5, Testcontainers (backend); Vitest, Testing Library (frontend); Playwright (E2E)
- **CI:** GitHub Actions

## Architecture

```
TaskForge (monorepo)
├── backend/          → Spring Boot REST API
│   ├── controller/   → REST endpoints (DTOs only, no entities)
│   ├── service/      → Business logic (transactional)
│   ├── repository/   → Spring Data JPA repositories
│   ├── model/        → JPA entities
│   ├── dto/          → Request/response records
│   ├── mapper/       → Hand-written mappers (entity ↔ DTO)
│   ├── exception/    → Domain exceptions + global handler
│   └── config/       → Security, CORS, OpenAPI config
└── frontend/         → Angular SPA
    ├── core/         → Guards, interceptors, singleton services
    ├── features/     → Feature modules (dashboard, tasks, projects)
    └── shared/       → Reusable components, models, pipes
```

## Key Conventions

- **API versioning:** All endpoints under `/api/v1/`
- **DTOs:** Java records for all request/response objects — never expose JPA entities
- **Dependency injection:** Constructor injection only (backend), `inject()` function (frontend)
- **Error handling:** Global `@RestControllerAdvice` with RFC 9457 Problem Detail responses
- **Database migrations:** Flyway — never modify existing migrations, always create new ones
- **Branch strategy:** Feature branches off `main`, squash merge via PR

## Specification Templates

When creating new components, ALWAYS read the relevant spec template first:

- `spec/spring-service.md` — How we write Spring services
- `spec/angular-component.md` — How we write Angular components
- `spec/rest-endpoint.md` — How we write REST endpoints

## Commands

- `mvn clean verify` — Build and test backend
- `cd frontend && ng serve` — Start frontend dev server (port 4200)
- `cd frontend && ng test` — Run frontend unit tests
- `docker compose up -d` — Start PostgreSQL + pgAdmin
- `mvn spring-boot:run -pl backend` — Start backend (port 8080)

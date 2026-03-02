# TaskForge Frontend — Module Memory

## This Module

Angular 21 SPA consuming the TaskForge REST API. Standalone components only — no NgModules.

## Project Structure

```
src/app/
├── core/              → Singleton services, guards, interceptors (provided in root)
│   ├── guards/        → Route guards (auth, role-based)
│   ├── interceptors/  → HTTP interceptors (auth token, error handling)
│   └── services/      → AuthService, ApiService, NotificationService
├── features/          → Feature areas (lazy-loaded routes)
│   ├── dashboard/     → Dashboard overview
│   ├── tasks/         → Task CRUD, Kanban board, detail view
│   │   ├── components/
│   │   ├── services/
│   │   └── store/     → NgRx Signal Store for task state
│   └── projects/      → Project management
└── shared/            → Reusable across features
    ├── components/    → UI components (confirm-dialog, loading-spinner, etc.)
    ├── models/        → TypeScript interfaces matching backend DTOs
    └── pipes/         → Custom pipes (date formatting, status display)
```

## Conventions

- **Standalone components only** — never create NgModules
- **Signals for state** — use `signal()`, `computed()`, `effect()` for component state
- **`inject()` function** — never use constructor injection or `@Inject` decorator
- **New control flow** — use `@if`, `@for`, `@switch` — never `*ngIf`, `*ngFor`
- **`input()` / `output()`** — signal-based inputs and outputs, not `@Input()` / `@Output()` decorators
- **Strict TypeScript** — no `any` types, define interfaces for all data shapes
- **Testing Library** — use `@testing-library/angular` for component tests, not raw `ComponentFixture`
- **RxJS in services only** — components use signals, services may use RxJS for HTTP and side effects

## API Integration

- Base URL: `environment.apiUrl` (defaults to `http://localhost:8080/api/v1`)
- Auth: JWT Bearer token in `Authorization` header via `AuthInterceptor`
- Error responses follow RFC 9457 Problem Detail — parse `title`, `detail`, `status` fields

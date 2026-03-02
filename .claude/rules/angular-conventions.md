---
description: Angular 21 conventions for the TaskForge frontend
paths:
  - "frontend/**/*.ts"
  - "frontend/**/*.html"
---

# Angular Conventions

## Components
- Standalone components ONLY — never create NgModules
- Feature-based folder structure: `features/<feature>/components/<component>/`
- Each component has: `.component.ts`, `.component.html`, `.component.scss`, `.component.spec.ts`
- Use `changeDetection: ChangeDetectionStrategy.OnPush` on all components

## TypeScript
- Strict mode — no `any` types anywhere
- Use `input()` and `output()` signal functions — never `@Input()` / `@Output()` decorators
- Use `inject()` function for dependency injection — never constructor injection
- Define interfaces for all component inputs and API response shapes

## Templates
- Use `@if` / `@for` / `@switch` control flow — never `*ngIf` / `*ngFor` / `[ngSwitch]`
- All interactive elements must have aria labels for accessibility
- Use `track` expression in all `@for` loops
- Never subscribe in templates — use `toSignal()` or the `async` pipe

## State Management
- Local component state: signals (`signal()`, `computed()`, `effect()`)
- Shared feature state: NgRx Signal Store
- Side effects and HTTP: RxJS in services, never in components

## Testing
- Use Testing Library (`@testing-library/angular`) — not raw `ComponentFixture`
- Test behavior, not implementation details
- Mock HTTP calls with `provideHttpClientTesting()`
- Each test must be independent — no shared mutable state

# How We Write Angular Components

## Structure
- Feature-based folder structure: `features/<feature>/components/<component>/`
- Each component has: `.component.ts`, `.component.html`, `.component.scss`, `.component.spec.ts`
- Use standalone components (no NgModules)
- Use `changeDetection: ChangeDetectionStrategy.OnPush`

## TypeScript Conventions
- Strict mode enabled — no `any` types
- Use `input()` and `output()` signal functions, not decorators
- Use `inject()` function for dependency injection
- Define interfaces for all component inputs

## Template Conventions
- Use `@if` / `@for` / `@switch` control flow (not `*ngIf` / `*ngFor`)
- Accessibility: all interactive elements have aria labels
- Use `track` expression for all `@for` loops
- Never subscribe in templates — use `toSignal()` or the `async` pipe

## State Management
- Local state: signals (`signal()`, `computed()`, `effect()`)
- Shared state: NgRx Signal Store
- Side effects: RxJS in services, not components

## Testing
- Use Testing Library (`@testing-library/angular`) over `ComponentFixture`
- Test behavior, not implementation
- Mock HTTP calls with `provideHttpClientTesting()`
- Each test should be independent — no shared mutable state

## Example

```typescript
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipModule } from '@angular/material/chip';
import { MatIconModule } from '@angular/material/icon';
import { Task, TaskStatus } from '../../shared/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [MatCardModule, MatChipModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card (click)="taskClicked.emit(task())" role="button"
              [attr.aria-label]="'Open task: ' + task().title">
      <mat-card-header>
        <mat-card-title>{{ task().title }}</mat-card-title>
        <mat-card-subtitle>{{ task().projectName }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>{{ task().description }}</p>
        <mat-chip-set aria-label="Task metadata">
          <mat-chip [class]="statusClass()">
            {{ task().status }}
          </mat-chip>
          @if (task().assigneeId) {
            <mat-chip>
              <mat-icon matChipAvatar>person</mat-icon>
              Assigned
            </mat-chip>
          }
        </mat-chip-set>
      </mat-card-content>
    </mat-card>
  `,
})
export class TaskCardComponent {
  task = input.required<Task>();
  taskClicked = output<Task>();

  statusClass = computed(() => {
    switch (this.task().status) {
      case TaskStatus.TODO: return 'status-todo';
      case TaskStatus.IN_PROGRESS: return 'status-in-progress';
      case TaskStatus.IN_REVIEW: return 'status-in-review';
      case TaskStatus.DONE: return 'status-done';
      case TaskStatus.CANCELLED: return 'status-cancelled';
    }
  });
}
```

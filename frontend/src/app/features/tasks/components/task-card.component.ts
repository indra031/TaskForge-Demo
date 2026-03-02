import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TaskSummary, TaskStatus } from '@shared/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [LowerCasePipe, MatCardModule, MatChipsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card
      (click)="taskClicked.emit(task())"
      role="button"
      tabindex="0"
      [attr.aria-label]="'Open task: ' + task().title"
      (keydown.enter)="taskClicked.emit(task())"
    >
      <mat-card-header>
        <mat-card-title>{{ task().title }}</mat-card-title>
        <mat-card-subtitle>{{ task().projectName }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <mat-chip-set aria-label="Task metadata">
          <mat-chip [class]="statusClass()">
            {{ task().status | lowercase }}
          </mat-chip>
          <mat-chip [class]="priorityClass()">
            {{ task().priority | lowercase }}
          </mat-chip>
          @if (task().dueDate) {
            <mat-chip>
              <mat-icon matChipAvatar>calendar_today</mat-icon>
              {{ task().dueDate }}
            </mat-chip>
          }
        </mat-chip-set>
      </mat-card-content>
    </mat-card>
  `,
})
export class TaskCardComponent {
  task = input.required<TaskSummary>();
  taskClicked = output<TaskSummary>();

  statusClass = computed(() => {
    switch (this.task().status) {
      case TaskStatus.TODO:
        return 'status-todo';
      case TaskStatus.IN_PROGRESS:
        return 'status-in-progress';
      case TaskStatus.IN_REVIEW:
        return 'status-in-review';
      case TaskStatus.DONE:
        return 'status-done';
      default:
        return '';
    }
  });

  priorityClass = computed(() => `priority-${this.task().priority.toLowerCase()}`);
}

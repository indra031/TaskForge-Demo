import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskCardComponent } from '../../tasks/components/task-card.component';
import { TaskSummary } from '@shared/models/task.model';

@Component({
  selector: 'app-recent-tasks-list',
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule, TaskCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Recent Tasks</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        @if (loading()) {
          <div class="spinner-container">
            <mat-spinner diameter="40" />
          </div>
        } @else if (tasks().length === 0) {
          <p class="empty-state">No tasks yet.</p>
        } @else {
          <div class="task-list">
            @for (task of tasks(); track task.id) {
              <app-task-card [task]="task" (taskClicked)="taskClicked.emit($event)" />
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 24px;
    }
    .empty-state {
      color: rgba(0, 0, 0, 0.5);
      text-align: center;
      padding: 24px 0;
    }
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 8px;
    }
  `,
})
export class RecentTasksListComponent {
  tasks = input.required<TaskSummary[]>();
  loading = input<boolean>(false);
  taskClicked = output<TaskSummary>();
}

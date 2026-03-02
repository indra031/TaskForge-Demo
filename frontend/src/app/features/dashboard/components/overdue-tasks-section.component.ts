import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { TaskCardComponent } from '../../tasks/components/task-card.component';
import { TaskSummary } from '@shared/models/task.model';

@Component({
  selector: 'app-overdue-tasks-section',
  standalone: true,
  imports: [MatCardModule, MatBadgeModule, MatIconModule, TaskCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (count() > 0) {
      <mat-card class="overdue-card">
        <mat-card-header>
          <mat-icon mat-card-avatar color="warn">warning</mat-icon>
          <mat-card-title>
            Overdue
            <span class="badge">{{ count() }}</span>
          </mat-card-title>
          <mat-card-subtitle>Tasks past their due date</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="task-list">
            @for (task of tasks(); track task.id) {
              <app-task-card [task]="task" (taskClicked)="taskClicked.emit($event)" />
            }
          </div>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    .overdue-card {
      border-left: 4px solid #f44336;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #f44336;
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 0.75rem;
      margin-left: 8px;
      vertical-align: middle;
    }
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 320px;
      overflow-y: auto;
      padding-top: 8px;
    }
  `,
})
export class OverdueTasksSectionComponent {
  tasks = input.required<TaskSummary[]>();
  count = input.required<number>();
  taskClicked = output<TaskSummary>();
}

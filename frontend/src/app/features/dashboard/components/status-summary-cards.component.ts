import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { StatusSummaryItem } from '../store/dashboard.store';
import { TaskStatus } from '@shared/models/task.model';

@Component({
  selector: 'app-status-summary-cards',
  standalone: true,
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="status-cards">
      @for (item of items(); track item.status) {
        <mat-card class="status-card" [class]="statusClass(item.status)">
          <mat-card-content>
            <div class="count">{{ item.count }}</div>
            <div class="label">{{ item.label }}</div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: `
    .status-cards {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .status-card {
      flex: 1;
      min-width: 120px;
      border-left: 4px solid transparent;
      text-align: center;
    }
    .count {
      font-size: 2rem;
      font-weight: 500;
      line-height: 1.2;
    }
    .label {
      font-size: 0.85rem;
      color: inherit;
      opacity: 0.6;
      margin-top: 4px;
    }
    .status-todo { border-left-color: #90a4ae; }
    .status-in-progress { border-left-color: #42a5f5; }
    .status-in-review { border-left-color: #ffa726; }
    .status-done { border-left-color: #66bb6a; }
    .status-cancelled { border-left-color: #ef9a9a; }
  `,
})
export class StatusSummaryCardsComponent {
  items = input.required<StatusSummaryItem[]>();

  statusClass(status: TaskStatus): string {
    const map: Record<TaskStatus, string> = {
      [TaskStatus.TODO]: 'status-todo',
      [TaskStatus.IN_PROGRESS]: 'status-in-progress',
      [TaskStatus.IN_REVIEW]: 'status-in-review',
      [TaskStatus.DONE]: 'status-done',
      [TaskStatus.CANCELLED]: 'status-cancelled',
    };
    return map[status] ?? '';
  }
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PrioritySummaryItem } from '../store/dashboard.store';
import { TaskPriority } from '@shared/models/task.model';

@Component({
  selector: 'app-priority-breakdown',
  standalone: true,
  imports: [MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Priority Breakdown</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="bar" role="img" aria-label="Priority distribution bar">
          @for (item of items(); track item.priority) {
            @if (item.percentage > 0) {
              <div
                class="segment"
                [class]="priorityClass(item.priority)"
                [style.flex-basis]="item.percentage + '%'"
                [attr.title]="item.label + ': ' + item.count"
              ></div>
            }
          }
        </div>
        <div class="legend">
          @for (item of items(); track item.priority) {
            <div class="legend-item">
              <span class="dot" [class]="priorityClass(item.priority)"></span>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-count">{{ item.count }}</span>
            </div>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .bar {
      display: flex;
      height: 24px;
      border-radius: 4px;
      overflow: hidden;
      margin: 8px 0 16px;
      background: rgba(128, 128, 128, 0.2);
    }
    .segment {
      height: 100%;
      min-width: 4px;
      transition: flex-basis 0.3s ease;
    }
    .legend {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
    }
    .dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .legend-label {
      color: inherit;
      opacity: 0.7;
    }
    .legend-count {
      font-weight: 500;
    }
    .priority-low { background-color: #81c784; }
    .priority-medium { background-color: #64b5f6; }
    .priority-high { background-color: #ffb74d; }
    .priority-critical { background-color: #e57373; }
  `,
})
export class PriorityBreakdownComponent {
  items = input.required<PrioritySummaryItem[]>();

  priorityClass(priority: TaskPriority): string {
    const map: Record<TaskPriority, string> = {
      [TaskPriority.LOW]: 'priority-low',
      [TaskPriority.MEDIUM]: 'priority-medium',
      [TaskPriority.HIGH]: 'priority-high',
      [TaskPriority.CRITICAL]: 'priority-critical',
    };
    return map[priority] ?? '';
  }
}

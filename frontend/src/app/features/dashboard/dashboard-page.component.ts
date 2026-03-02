import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DashboardStore } from './store/dashboard.store';
import { StatusSummaryCardsComponent } from './components/status-summary-cards.component';
import { RecentTasksListComponent } from './components/recent-tasks-list.component';
import { OverdueTasksSectionComponent } from './components/overdue-tasks-section.component';
import { PriorityBreakdownComponent } from './components/priority-breakdown.component';
import { TaskSummary } from '@shared/models/task.model';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
    StatusSummaryCardsComponent,
    RecentTasksListComponent,
    OverdueTasksSectionComponent,
    PriorityBreakdownComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.loading()) {
      <div class="loading-container">
        <mat-spinner diameter="56" />
      </div>
    } @else if (store.hasError()) {
      <div class="error-container">
        <mat-icon color="warn">error_outline</mat-icon>
        <p>{{ store.error() }}</p>
      </div>
    } @else {
      <div class="dashboard">
        <h1 class="page-title">Dashboard</h1>

        <section aria-label="Task status summary">
          <app-status-summary-cards [items]="store.statusSummary()" />
        </section>

        <div class="dashboard-grid">
          <section class="recent-tasks" aria-label="Recent tasks">
            <app-recent-tasks-list
              [tasks]="store.recentTasks()"
              [loading]="store.loading()"
              (taskClicked)="onTaskClicked($event)"
            />
          </section>

          <aside class="side-widgets">
            <app-overdue-tasks-section
              [tasks]="store.overdueTasks()"
              [count]="store.overdueCount()"
              (taskClicked)="onTaskClicked($event)"
            />

            <app-priority-breakdown [items]="store.prioritySummary()" />
          </aside>
        </div>
      </div>
    }
  `,
  styles: `
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 60vh;
    }
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 48px;
      color: rgba(0, 0, 0, 0.6);
    }
    .dashboard {
      padding: 24px;
    }
    .page-title {
      font-size: 1.5rem;
      font-weight: 500;
      margin: 0 0 24px;
    }
    section {
      margin-bottom: 24px;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
      align-items: start;
    }
    .side-widgets {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    @media (max-width: 900px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class DashboardPageComponent implements OnInit {
  protected readonly store = inject(DashboardStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.store.loadDashboard();
  }

  onTaskClicked(task: TaskSummary): void {
    this.router.navigate(['/tasks', task.id]);
  }
}

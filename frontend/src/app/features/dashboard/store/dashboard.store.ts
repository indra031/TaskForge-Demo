import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, forkJoin, pipe, switchMap, tap } from 'rxjs';
import { TaskService } from '../../tasks/services/task.service';
import { DashboardService } from '../services/dashboard.service';
import { TaskPriority, TaskStatus, TaskSummary } from '@shared/models/task.model';
import { TaskStats } from '@shared/models/task-stats.model';

export interface StatusSummaryItem {
  status: TaskStatus;
  count: number;
  label: string;
}

export interface PrioritySummaryItem {
  priority: TaskPriority;
  count: number;
  label: string;
  percentage: number;
}

interface DashboardState {
  stats: TaskStats | null;
  recentTasks: TaskSummary[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  recentTasks: [],
  loading: false,
  error: null,
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.IN_REVIEW]: 'In Review',
  [TaskStatus.DONE]: 'Done',
  [TaskStatus.CANCELLED]: 'Cancelled',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.HIGH]: 'High',
  [TaskPriority.CRITICAL]: 'Critical',
};

const STATUS_ORDER: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
  TaskStatus.CANCELLED,
];

const PRIORITY_ORDER: TaskPriority[] = [
  TaskPriority.CRITICAL,
  TaskPriority.HIGH,
  TaskPriority.MEDIUM,
  TaskPriority.LOW,
];

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    statusSummary: computed<StatusSummaryItem[]>(() => {
      const stats = store.stats();
      if (!stats) return [];
      return STATUS_ORDER.map((status) => ({
        status,
        count: stats.statusCounts[status] ?? 0,
        label: STATUS_LABELS[status],
      }));
    }),
    prioritySummary: computed<PrioritySummaryItem[]>(() => {
      const stats = store.stats();
      if (!stats) return [];
      const total = stats.totalTasks || 1;
      return PRIORITY_ORDER.map((priority) => {
        const count = stats.priorityCounts[priority] ?? 0;
        return {
          priority,
          count,
          label: PRIORITY_LABELS[priority],
          percentage: Math.round((count / total) * 100),
        };
      });
    }),
    overdueTasks: computed(() => store.stats()?.overdueTasks ?? []),
    overdueCount: computed(() => store.stats()?.overdueCount ?? 0),
    totalTasks: computed(() => store.stats()?.totalTasks ?? 0),
    hasError: computed(() => store.error() !== null),
  })),
  withMethods(
    (
      store,
      dashboardService = inject(DashboardService),
      taskService = inject(TaskService)
    ) => ({
      loadDashboard: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            forkJoin([
              dashboardService.getStats(),
              taskService.findAll(undefined, undefined, 0, 8),
            ]).pipe(
              tap(([stats, recentPage]) =>
                patchState(store, {
                  stats,
                  recentTasks: recentPage.content,
                  loading: false,
                })
              ),
              catchError((err) => {
                patchState(store, {
                  loading: false,
                  error: err.message ?? 'Failed to load dashboard',
                });
                return EMPTY;
              })
            )
          )
        )
      ),
    })
  )
);

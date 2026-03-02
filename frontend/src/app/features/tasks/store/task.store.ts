import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { TaskService } from '../services/task.service';
import { TaskSummary, TaskStatus } from '@shared/models/task.model';

interface TaskState {
  tasks: TaskSummary[];
  loading: boolean;
  error: string | null;
  selectedStatus: TaskStatus | null;
  totalElements: number;
  currentPage: number;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  selectedStatus: null,
  totalElements: 0,
  currentPage: 0,
};

export const TaskStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    todoTasks: computed(() => store.tasks().filter((t) => t.status === TaskStatus.TODO)),
    inProgressTasks: computed(() =>
      store.tasks().filter((t) => t.status === TaskStatus.IN_PROGRESS)
    ),
    inReviewTasks: computed(() =>
      store.tasks().filter((t) => t.status === TaskStatus.IN_REVIEW)
    ),
    doneTasks: computed(() => store.tasks().filter((t) => t.status === TaskStatus.DONE)),
    hasError: computed(() => store.error() !== null),
  })),
  withMethods((store, taskService = inject(TaskService)) => ({
    loadTasks: rxMethod<{ status?: TaskStatus; page?: number }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ status, page }) =>
          taskService.findAll(status, undefined, page).pipe(
            tap({
              next: (result) =>
                patchState(store, {
                  tasks: result.content,
                  totalElements: result.totalElements,
                  currentPage: result.number,
                  loading: false,
                }),
              error: (err) =>
                patchState(store, {
                  loading: false,
                  error: err.message ?? 'Failed to load tasks',
                }),
            })
          )
        )
      )
    ),
    setStatusFilter(status: TaskStatus | null) {
      patchState(store, { selectedStatus: status });
    },
  }))
);

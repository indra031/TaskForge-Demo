import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, Page } from '@core/services/api.service';
import {
  CreateTaskRequest,
  Task,
  TaskSummary,
  TaskStatus,
  UpdateTaskRequest,
} from '@shared/models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly api = inject(ApiService);

  findAll(
    status?: TaskStatus,
    assigneeId?: string,
    page = 0,
    size = 20
  ): Observable<Page<TaskSummary>> {
    const params: Record<string, string | number> = { page, size };
    if (status) params['status'] = status;
    if (assigneeId) params['assigneeId'] = assigneeId;
    return this.api.get<Page<TaskSummary>>('/tasks', params);
  }

  findById(id: string): Observable<Task> {
    return this.api.get<Task>(`/tasks/${id}`);
  }

  create(request: CreateTaskRequest): Observable<Task> {
    return this.api.post<Task>('/tasks', request);
  }

  update(id: string, request: UpdateTaskRequest): Observable<Task> {
    return this.api.put<Task>(`/tasks/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(`/tasks/${id}`);
  }

  assign(taskId: string, assigneeId: string): Observable<Task> {
    return this.api.post<Task>(`/tasks/${taskId}/assign`, assigneeId);
  }
}

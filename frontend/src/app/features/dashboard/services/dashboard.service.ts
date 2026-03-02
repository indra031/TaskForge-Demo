import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { TaskStats } from '@shared/models/task-stats.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  getStats(): Observable<TaskStats> {
    return this.api.get<TaskStats>('/tasks/stats');
  }
}

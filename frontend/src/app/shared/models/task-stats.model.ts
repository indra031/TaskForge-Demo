import { TaskPriority, TaskStatus, TaskSummary } from './task.model';

export interface TaskStats {
  statusCounts: Record<TaskStatus, number>;
  priorityCounts: Record<TaskPriority, number>;
  totalTasks: number;
  overdueTasks: TaskSummary[];
  overdueCount: number;
}

package com.taskforge.repository;

import com.taskforge.model.Task;
import com.taskforge.model.TaskStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    Page<Task> findByProjectId(UUID projectId, Pageable pageable);

    Page<Task> findByStatus(TaskStatus status, Pageable pageable);

    Page<Task> findByAssigneeId(UUID assigneeId, Pageable pageable);

    @Query("""
            SELECT t FROM Task t
            WHERE (:status IS NULL OR t.status = :status)
            AND (:assigneeId IS NULL OR t.assigneeId = :assigneeId)
            """)
    Page<Task> findByFilters(TaskStatus status, UUID assigneeId, Pageable pageable);

    long countByProjectIdAndStatus(UUID projectId, TaskStatus status);

    @Query("SELECT t.status AS status, COUNT(t) AS count FROM Task t GROUP BY t.status")
    List<StatusCount> countGroupedByStatus();

    @Query("SELECT t.priority AS priority, COUNT(t) AS count FROM Task t GROUP BY t.priority")
    List<PriorityCount> countGroupedByPriority();

    @Query("""
            SELECT t FROM Task t
            WHERE t.dueDate < :today
            AND t.status NOT IN (com.taskforge.model.TaskStatus.DONE, com.taskforge.model.TaskStatus.CANCELLED)
            ORDER BY t.dueDate ASC
            """)
    Page<Task> findOverdueTasks(LocalDate today, Pageable pageable);

    @Query("""
            SELECT COUNT(t) FROM Task t
            WHERE t.dueDate < :today
            AND t.status NOT IN (com.taskforge.model.TaskStatus.DONE, com.taskforge.model.TaskStatus.CANCELLED)
            """)
    long countOverdueTasks(LocalDate today);
}

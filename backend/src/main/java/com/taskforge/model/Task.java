package com.taskforge.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "tasks")
@Getter
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Task extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(length = 4000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    private UUID assigneeId;

    private LocalDate dueDate;

    public void assignToProject(Project project) {
        this.project = project;
    }

    public void changeStatus(TaskStatus status) {
        this.status = status;
    }

    public void changePriority(TaskPriority priority) {
        this.priority = priority;
    }

    public void updateTitle(String title) {
        this.title = title;
    }

    public void updateDescription(String description) {
        this.description = description;
    }

    public void assignTo(UUID assigneeId) {
        this.assigneeId = assigneeId;
    }

    public void rescheduleDueTo(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}

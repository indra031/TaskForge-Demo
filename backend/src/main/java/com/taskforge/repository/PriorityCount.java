package com.taskforge.repository;

import com.taskforge.model.TaskPriority;

public interface PriorityCount {
    TaskPriority getPriority();
    Long getCount();
}

package com.taskforge.repository;

import com.taskforge.model.TaskStatus;

public interface StatusCount {
    TaskStatus getStatus();
    Long getCount();
}

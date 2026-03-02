package com.taskforge.repository;

import com.taskforge.model.Project;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Optional<Project> findByKey(String key);

    boolean existsByKey(String key);
}

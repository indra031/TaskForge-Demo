CREATE TABLE tasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255)    NOT NULL,
    description VARCHAR(4000),
    status      VARCHAR(20)     NOT NULL DEFAULT 'TODO',
    priority    VARCHAR(20)     NOT NULL DEFAULT 'MEDIUM',
    project_id  UUID            NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id UUID,
    due_date    DATE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_by  VARCHAR(255)
);

CREATE INDEX idx_tasks_project_id ON tasks (project_id);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_assignee_id ON tasks (assignee_id);
CREATE INDEX idx_tasks_status_assignee ON tasks (status, assignee_id);

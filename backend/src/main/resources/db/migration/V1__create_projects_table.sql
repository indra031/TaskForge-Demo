CREATE TABLE projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255)    NOT NULL,
    description VARCHAR(1000),
    key         VARCHAR(10)     NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_by  VARCHAR(255)
);

CREATE INDEX idx_projects_key ON projects (key);

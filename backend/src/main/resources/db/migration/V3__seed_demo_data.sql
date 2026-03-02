-- Demo data for training presentations
-- This migration inserts sample projects and tasks for demonstration purposes

INSERT INTO projects (id, name, description, key) VALUES
    ('a1b2c3d4-0001-0001-0001-000000000001', 'TaskForge Platform', 'The TaskForge application itself', 'TF'),
    ('a1b2c3d4-0001-0001-0001-000000000002', 'Mobile App', 'TaskForge mobile companion app', 'MOB'),
    ('a1b2c3d4-0001-0001-0001-000000000003', 'API Integrations', 'Third-party API integrations', 'INT');

INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, due_date) VALUES
    -- TaskForge Platform tasks
    ('b2c3d4e5-0001-0001-0001-000000000001', 'Implement user authentication',
     'Add JWT-based authentication with login, registration, and token refresh endpoints',
     'IN_PROGRESS', 'HIGH', 'a1b2c3d4-0001-0001-0001-000000000001', NULL, '2026-03-15'),

    ('b2c3d4e5-0001-0001-0001-000000000002', 'Create Kanban board component',
     'Build a drag-and-drop Kanban board for task status management using Angular CDK',
     'TODO', 'HIGH', 'a1b2c3d4-0001-0001-0001-000000000001', NULL, '2026-03-20'),

    ('b2c3d4e5-0001-0001-0001-000000000003', 'Add task search and filtering',
     'Implement full-text search with filters for status, priority, assignee, and due date',
     'TODO', 'MEDIUM', 'a1b2c3d4-0001-0001-0001-000000000001', NULL, '2026-04-01'),

    ('b2c3d4e5-0001-0001-0001-000000000004', 'Set up CI/CD pipeline',
     'Configure GitHub Actions for build, test, and deployment',
     'DONE', 'HIGH', 'a1b2c3d4-0001-0001-0001-000000000001', NULL, NULL),

    ('b2c3d4e5-0001-0001-0001-000000000005', 'Add email notifications',
     'Send email notifications when tasks are assigned, completed, or approaching due date',
     'TODO', 'LOW', 'a1b2c3d4-0001-0001-0001-000000000001', NULL, '2026-04-15'),

    -- Mobile App tasks
    ('b2c3d4e5-0001-0001-0001-000000000006', 'Design mobile wireframes',
     'Create wireframes for the mobile app task list, detail, and creation screens',
     'IN_REVIEW', 'MEDIUM', 'a1b2c3d4-0001-0001-0001-000000000002', NULL, '2026-03-10'),

    -- API Integrations tasks
    ('b2c3d4e5-0001-0001-0001-000000000007', 'Slack integration for task updates',
     'Post task status changes to a configurable Slack channel via webhook',
     'TODO', 'MEDIUM', 'a1b2c3d4-0001-0001-0001-000000000003', NULL, '2026-04-01');

# Business Requirement: Task Comments

**From:** Product Owner
**Priority:** High
**Context:** TaskForge project management tool

## What We Need

Users have been asking for a way to discuss tasks directly inside TaskForge.
Right now they switch to Slack or email to talk about a task, and that
context gets lost. We want a simple comment thread on each task.

Requirements from user interviews:

- Post a comment on any task they have access to
- Edit their own comments (typos happen)
- Delete their own comments
- See comments in reverse chronological order (newest first)
- Plain text only for now — no attachments, no rich text, no @mentions

## Who Needs It

- All TaskForge users who can view a task
- Authors can edit/delete only their own comments

## Notes from Stakeholder Meeting

- "Keep it simple — just text comments. We can add attachments and
  mentions in a future iteration."
- "Comments should show the author's name, not their ID"
- "If a task gets deleted, its comments should be cleaned up too"
- "We need this for the next release, so let's keep scope tight"

# Business Requirement: Dashboard Statistics

**From:** Product Owner
**Priority:** Medium
**Context:** TaskForge project management tool

## What We Need

The team leads want to see some kind of stats dashboard for their projects.
Right now they have to manually count tasks in different states to report
progress in standups. They want to open a project and quickly see things like:

- How many tasks are open vs done
- Which tasks are overdue
- How long tasks typically take to complete

Nothing fancy — just the numbers. Some managers mentioned they check this
multiple times a day, so it shouldn't be slow.

## Who Needs It

- Team leads (daily)
- Project managers (weekly reporting)
- Engineering managers (sprint retrospectives)

## Notes from Stakeholder Meeting

- "We don't need charts yet, just the raw numbers via API — frontend team
  will build the widgets later"
- "It has to work per-project, not globally"
- "If it's a few minutes stale, that's fine — doesn't need to be real-time"

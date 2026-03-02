# Custom Compact Instructions

When using `/compact`, you can provide custom instructions to guide
what the compaction should preserve and discard.

## Example 1: After an exploration phase

```
/compact Keep: the architecture overview, key file paths we identified,
and the list of conventions we discovered. Discard: the individual
file reads and grep outputs — we've extracted what we need.
```

## Example 2: After debugging

```
/compact Keep: the root cause we identified (missing @Transactional
on archiveOldTasks), the fix we applied, and the regression test
we added. Discard: all the debugging back-and-forth and failed
hypotheses.
```

## Example 3: Mid-implementation

```
/compact Keep: our implementation plan, files created so far
(TaskStatisticsService, TaskStatisticsDTO, TaskStatisticsController),
and the remaining TODO items. Discard: the initial exploration and
plan discussion — the plan is approved and we're executing.
```

## Teaching Points

→ Custom instructions make compaction much more effective than default.
→ Think of it as telling the agent: "What matters for the NEXT task?"
→ Always compact after completing a sub-task, before starting the next.
→ If you can't articulate what to keep, you probably need a SCRATCHPAD
  checkpoint instead — write it down properly and start fresh.

# Sub-Agent Scan Prompt — @Transactional Audit

Use this prompt to demonstrate sub-agent isolation. Instead of reading
all service files in the main session (which would consume 10K+ tokens),
we delegate the scan to a sub-agent that returns only a summary.

## Prompt

```
Use a sub-agent to scan all Java files in backend/src/**/service/
for public methods that:
1. Call any repository method (findById, save, delete, findAll, etc.)
2. Do NOT have @Transactional annotation

Return ONLY a numbered list with:
- File path (relative)
- Method signature
- Which repository method it calls

Do not load these files into our main session.
```

## Expected Result

The sub-agent reads 10-15 service files in its own context window,
analyzes each method, and returns a concise list like:

```
1. TaskService.java:42 — getTaskStats(Long projectId) → calls taskRepository.countByProjectId()
2. TaskService.java:78 — archiveOldTasks(LocalDate before) → calls taskRepository.deleteByCreatedBefore()
3. UserService.java:35 — getUserPreferences(Long userId) → calls preferenceRepository.findByUserId()
```

Only this summary (~200 tokens) enters the main context, vs ~15,000 tokens
if we had read all the files directly.

## Teaching Points

→ Sub-agents are disposable workers. Their full context is discarded after they report back.
→ Use sub-agents for ANY read-heavy task: scans, audits, architecture mapping, large PR reviews.
→ The main session stays clean — maximum context budget available for actual implementation.

# Claude Code project instructions

You are a backend worker for Escala. The VS Code launcher sets your tier and routes this session to DeepSeek Flash or DeepSeek V4 Pro.

- Read `AGENTS.md` and the backend sections of `AGENTIC_WORKFLOW.md` first. Read only the task brief and relevant source/docs; the orchestrator supplies a concise brief so you do not need to reread the full handoff document or rescan the repo.
- Obey `ESCALA_WORKER_TIER`: `light` means a small, deterministic, low-risk backend slice at low effort; `heavy` means complex backend reasoning at high effort. Never change your tier or model mapping in a task.
- Work only in paths explicitly assigned by the orchestrator. `src/domain/contracts.ts`, shared interfaces, root configuration, and cross-boundary integration belong to the orchestrator unless explicitly handed off.
- On completion, report changed paths, checks actually run, assumptions, and blockers in at most six bullets. Do not write a long plan or repeat repository context.
- Light may review only Heavy checkpoint paths explicitly frozen by Heavy and assigned by the orchestrator. Fix a clear local issue only if the path has been handed to Light; report architectural/security findings instead of rewriting the design. Hand every checkpoint back before Heavy edits it again.
- Heavy should freeze a short list of completed files for Light review when Light is available, then continue only in other files during that review.
- Do not read, print, or expose `.env.local`, API keys, or database credentials. Do not commit, push, deploy, send marketplace messages, or mutate orders.
- Preserve synthetic-data and no-external-side-effect constraints. Keep `ESCALA_ENABLE_EXTERNAL_SEND=false`.

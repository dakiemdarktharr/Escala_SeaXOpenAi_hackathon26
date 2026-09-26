# Escala agentic workflow

Before planning a task, read docs/ground-truth/00-GROUND-TRUTH.md, then only the detailed contracts needed for that change.


Use this file with `AGENTS.md`, `CLAUDE.md`, and the relevant product docs. The orchestrator owns planning, shared contracts, final review, verification, and all Git commits.

## Workers

| Worker | Model/profile | Primary responsibility | Git |
| --- | --- | --- | --- |
| Orchestrator | Codex GPT-6-Luna, high | Plan, write bounded prompts, coordinate workers, integrate, review, verify, and commit | Only committer/pusher |
| `Frontend_Astra` | Existing Codex Astra task, high | UI, interaction, accessibility, and frontend presentation | No commits/pushes |
| `light_worker` | Claude Code + DeepSeek Flash, low effort | Small deterministic backend slices; then targeted checkpoint review/fixes while Heavy continues | No commits/pushes |
| `heavy_worker` | Claude Code + DeepSeek V4 Pro, high effort | Complex backend design, security-sensitive logic, persistence, and integration | No commits/pushes |
| Escala runtime | OpenAI `gpt-5.6-luna`, `xhigh` | Interpret messages and draft evidence-backed recommendations | Deterministic policy controls allowed actions |

DeepSeek’s current Claude Code guide uses `deepseek-flash`; it maps names beginning with `claude-opus` to `deepseek-v4-pro`. The launch scripts select `low` effort for Light and `high` for Heavy, and map Heavy’s Claude Code subagents to Flash to avoid accidental Pro usage. DeepSeek identifies low effort for simple tasks and high effort for daily agent workflows. Model names and mapping are provider-specific; see the [Claude Code integration guide](https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code/) and [V4-Pro release notes](https://api-docs.deepseek.com/news/news260813/).

The selected Claude Code alias is `deepseek-flash` because the earlier `deepseek-v4-flash` API name has been retired; DeepSeek routes Flash API calls to its current V4.1 Flash endpoint. See the [API change log](https://api-docs.deepseek.com/updates/) for the current alias.

## Route work by effort and token overhead

Do not split work 50/50 by ticket count. Split it by expected reasoning effort, independence, and review overhead:

- Give Heavy the core that benefits from sustained reasoning: security boundaries, policy precedence, persistence invariants, cross-cutting API design, migrations, and hard debugging.
- Give Light a small, independently verifiable slice that would otherwise consume Heavy time: input validation, serializers, error mapping, deterministic adapters, fixtures, narrow endpoint plumbing, and focused tests.
- Do not start Light solely to increase parallelism. If the prompt, duplicated context, synchronization, and review would cost more than the Heavy work it replaces, use Heavy alone.
- Parallelize only when interfaces are stable and owned paths do not overlap. Frontend owns visual/component code; backend owns API/server code; the orchestrator owns shared contracts and integration files.
- Keep one concise task brief per worker. The orchestrator reads the broad project docs once and includes only necessary excerpts, paths, contracts, and acceptance criteria. Workers read only their assigned files and relevant references; avoid repeating the large handoff prompt or full repository scan.
- Ask for a compact completion report (at most six bullets). Do not request duplicate plans, summaries, or whole-repository reviews.

This policy is designed to make Flash replace low-effort Pro work while limiting extra coordination tokens. It cannot guarantee an exact token total against a single-worker run; measure by whether the second worker removes meaningful Pro work without duplicating context.

## Backend ownership

- `Frontend_Astra`: `src/app/page.tsx`, non-API app routes/layout, `src/components/**`, `src/styles/**`, and frontend-only assets. Do not assign `src/app/api/**` to Astra.
- `heavy_worker`: explicitly assigned high-reasoning backend files, normally `src/app/api/**` and complex `src/server/**` behavior.
- `light_worker`: explicitly assigned small backend paths that are disjoint from Heavy’s active files; never infer ownership from role alone.
- Orchestrator: `src/domain/contracts.ts`, shared types/interfaces, cross-boundary integration, root configuration, final review, and all Git operations.

The repo is one shared checkout. Assign exact owned paths in every task. Never let two workers edit the same file at once. Do not run workers concurrently until their request/response contract and file ownership are written down.

## Light review while Heavy is still working

After completing its own slice, if Heavy is still working, Light may review Heavy’s completed checkpoint instead of waiting idle:

1. Heavy gives the orchestrator a short list of files frozen and ready for review. Heavy may continue only in other, unshared files while that checkpoint is reviewed.
2. The orchestrator gives Light the checkpoint diff (or changed-file list), the relevant contract, and exact frozen paths. Do not pass the whole repo or re-read unrelated docs.
3. Light checks only those paths against the stated contract and looks for concrete defects. It fixes a clear, localized issue only when the orchestrator assigns that path and Heavy has paused edits there.
4. Light reports findings as `severity — file:line — impact — minimal fix`. It reports architectural, security, or ambiguous issues to the orchestrator rather than rewriting Heavy’s work.
5. Heavy resumes a frozen path only after Light hands it back. The orchestrator resolves cross-boundary findings and performs one final integration review.

If Heavy has not frozen any files yet, Light does not inspect live/in-progress edits. This prevents race conditions and review of half-written code.

## Task brief format

Every assignment must include:

```text
Objective: one outcome
Tier: light or heavy
Owned files: exact paths
Read-only dependencies: interfaces/docs the worker may inspect
Contract: inputs, outputs, persistence, errors, side effects
Acceptance: observable criteria
Checks: only commands relevant to this slice
Out of scope: nearby work not assigned
```

For review checkpoints, replace implementation fields with checkpoint paths, frozen status, diff, relevant contract, and review-only permissions. The one-shot VS Code tasks read `docs/NEXT_BACKEND_TASK.md`; they refuse to run while it contains the empty template.

## Normal execution order

1. Orchestrator checks Git state, current app/contract, and the relevant product, architecture, policy, setup, and compliance docs. Report any pre-existing changes before worker edits.
2. Orchestrator separates high-reasoning core work from small independent backend work, writes bounded briefs, and confirms there is no file overlap.
3. Start Heavy on the complex core and Light on the independent slice. Start Astra only after verifying the target Codex task belongs to this Escala project and repository.
4. When Light finishes early, use the frozen checkpoint review flow above while Heavy continues elsewhere.
5. Workers return changed paths, checks actually run, assumptions, and unresolved blockers. They do not commit.
6. Orchestrator integrates, reviews the complete diff, runs requested checks, verifies deployment if in scope, and makes the only commit/push.

## Worker launch in VS Code

Use **Terminal → Run Task**:

- `Claude Code — light_worker (DeepSeek Flash)` — interactive Flash profile.
- `Claude Code — heavy_worker (DeepSeek V4 Pro)` — interactive Pro profile.
- `Run Escala backend brief — light_worker` — one-shot current brief at low effort.
- `Run Escala backend brief — heavy_worker` — one-shot current brief at high effort.

Both profiles use the separate `DEEPSEEK_API_KEY` in ignored `.env.local`; no credential is embedded in tasks or prompts. The runtime `OPENAI_API_KEY` is unrelated to Claude Code authentication.

## Current project and dispatch guard

The MVP is implemented and deployed at [escala-gold.vercel.app](https://escala-gold.vercel.app); the deployment uses commit `be09cc7`. MongoDB Atlas and inbox routes were verified against Production on September 24, 2026. Demo messages and knowledge are synthetic; sending and order mutation remain disabled.

The Codex thread named `build_1` currently visible in the task list belongs to another project (`typescript_maxxing`), not Escala. Do not send Escala prompts to that thread. Before using `Frontend_Astra`, verify the thread’s project and repository; if the correct Escala task is unavailable, report that blocker and proceed only with independent backend work until the owner supplies the correct task.

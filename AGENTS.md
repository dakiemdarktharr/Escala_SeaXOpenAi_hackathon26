# Ground truth

Before planning or changing product behavior, read docs/ground-truth/00-GROUND-TRUTH.md and then the relevant detailed contract under docs/. Keep that note synchronized with any product, policy, model, data, or worker ownership change.

# Agent roles

- **Orchestrator — Codex GPT-6-Luna, high:** plan work, read broad project context once, split tasks by model effort, own shared contracts and integration, review, verify, and make the only Git commits/pushes.
- **Frontend_Astra — Astra in Codex, high:** implement Escala UI from the approved brief. Own `src/app/page.tsx`, non-API app routes/layout, `src/components/**`, `src/styles/**`, and frontend-only assets. Never commit or push.
- **light_worker — Claude Code + DeepSeek Flash, low effort:** implement small, deterministic, independent backend slices. When its slice is complete and Heavy is still working, review Heavy's frozen checkpoints and fix only concrete localized issues explicitly assigned by the orchestrator. Never commit or push.
- **heavy_worker — Claude Code + DeepSeek V4 Pro, high effort:** handle complex backend reasoning, security-sensitive logic, persistence invariants, and difficult integration. Freeze completed paths for Light review and continue only in other files. Never commit or push.
- **Escala runtime LLM — OpenAI `gpt-5.6-luna`, `xhigh`:** assist with message interpretation and grounded recommendations; deterministic policy remains authoritative.

## Handoff and integration

1. Read `AGENTIC_WORKFLOW.md`; the orchestrator reads broad product, architecture, policy, setup, and compliance docs once and sends each worker only relevant context.
2. Write bounded briefs with objective, tier, exact owned paths, read-only dependencies, contract, acceptance criteria, checks, and out-of-scope work.
3. Route high-reasoning backend work to Heavy and low-risk independent work to Light. Do not split just to parallelize; include context and review overhead in the token decision.
4. Confirm the Frontend_Astra Codex task belongs to this Escala project before dispatch. Never use a same-named task from another project.
5. Keep concurrent edits on disjoint paths. Heavy freezes review checkpoints; Light checks those completed paths while Heavy works elsewhere, then hands them back.
6. Workers report changed paths, checks actually run, assumptions, and unresolved issues. The orchestrator integrates, reviews, validates, and commits.

## Project constraints

- `MASTER-HANDOFF-PROMPT-ESCALA.md` and current `docs/` are product/hackathon references; use implemented source and tests to understand existing interfaces.
- The owner approved a working Shopee Seller Centre-inspired seller support MVP using MongoDB Atlas, OpenAI Responses, and the supplied Vercel project. This supersedes original Phase 0/deferred-infrastructure notes.
- Build original Escala code and artifacts. Do not copy from other repositories.
- Escala runtime uses `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-5.6-luna`, and `OPENAI_REASONING_EFFORT=xhigh`. `DEEPSEEK_API_KEY` is reserved for Claude Code workers and is a separate credential.
- Never read credentials into chat or command output. Keep them in ignored `.env.local` and Vercel's protected environment settings.
- No real marketplace sends or order mutations; `ESCALA_ENABLE_EXTERNAL_SEND=false` stays the default.
- Light uses `deepseek-flash`; Heavy uses `claude-opus-4-6`, which DeepSeek maps to `deepseek-v4-pro`. Keep Heavy subagents on `deepseek-flash`.
- This repository is one shared working tree. No worker edits another worker's owned or currently active file; only the orchestrator owns cross-boundary contracts and Git.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent roles

- **Orchestrator — GPT-6-Luna, high:** plan work, maintain integration contracts, inject project context into worker prompts, review every change, resolve conflicts, run requested checks, and make the only Git commits.
- **Frontend — Astra, high, task `build_1`:** implement Escala's frontend after receiving an approved feature brief. Own frontend files and frontend-specific docs. Never commit or push.
- **Backend — Claude Code via DeepSeek V4 Pro in VS Code:** implement API, policy, OpenAI integration, Mongo persistence, and seed/audit flow from the scoped contract. Never commit or push.

## Handoff and integration

1. The orchestrator reads the current product, architecture, policy, setup, and compliance documents before planning.
2. Workers report baseline, files owned, contract assumptions, and checks before editing.
3. Frontend and backend agree on a versioned request/response/event contract before parallel implementation. The orchestrator owns cross-boundary contract changes.
4. Keep workers' edits in their owned files. If work must overlap, stop and hand the conflict to the orchestrator instead of overwriting another worker's changes.
5. Workers run their scoped checks and report exact results. The orchestrator reviews the complete diff, runs final requested validation, and commits.

## Project constraints

- `MASTER-HANDOFF-PROMPT-ESCALA.md` and `docs/` are the product and hackathon source of truth.
- The owner approved an MVP now: Shopee Seller Centre inspired support console, MongoDB Atlas persistence, OpenAI Responses API, and deployment to the supplied Vercel project. This supersedes the original Phase 0/deferred-infrastructure setup note.
- Current code is still the Phase 0 baseline. Do not invent existing UI, API, or backend interfaces.
- Build original Escala code and artifacts. Do not copy from other repositories.
- Escala runtime uses `OPENAI_API_KEY`, `OPENAI_MODEL=gpt-5.6-luna`, and `OPENAI_REASONING_EFFORT=xhigh`. `DEEPSEEK_API_KEY` is reserved for the Claude Code worker and is a separate credential.
- Never read credentials into chat or command output. Keep them in ignored `.env.local` and Vercel's protected environment settings.
- No real marketplace sends or order mutations; `ESCALA_ENABLE_EXTERNAL_SEND=false` stays the default.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

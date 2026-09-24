# Agentic workflow

## Roles

| Worker | Model | Responsibility | Git |
| --- | --- | --- | --- |
| Current task | GPT-6-Luna, high | Orchestration, planning, prompt context, integration review, validation, sole committer | Sole writer of commits |
| `build_1` | GPT-6-Astra, high | Escala frontend implementation | No commits or pushes |
| VS Code task `Claude Code (DeepSeek V4 Pro)` | DeepSeek V4 Pro through Claude Code | Scoped backend/API work when the product brief calls for it | No commits or pushes |
| Escala runtime LLM | OpenAI `gpt-5.6-luna`, `xhigh` | Message interpretation and grounded response draft only | Deterministic policy retains action authority |

## Handoff sequence

1. Start every request with a repository status and a read of the relevant product and architecture docs.
2. Give each worker a bounded file scope, an agreed contract, acceptance criteria, and required checks.
3. Run the frontend worker and backend worker on disjoint files. The orchestrator owns shared contracts and integration files.
4. Require a completion report with changed files, checks, assumptions, and unresolved issues.
5. Review the full diff, resolve conflicts, run the user-requested validation, then commit from the orchestrator task.

## Current project state

- The owner approved starting the MVP now, superseding the original Phase 0/deferred-service note.
- Target: Shopee Seller Centre inspired support inbox, MongoDB Atlas persistence, OpenAI Responses API (`gpt-5.6-luna`, `xhigh`), deployed through the supplied Escala Vercel project.
- MongoDB authenticated read-only ping succeeded earlier. Product-code connectivity remains to be implemented and verified.
- `build_1` accepted the scoped Shopee-inspired UI brief and is implementing `src/app/**`, `src/components/**`, and `src/styles/**`.
- `OPENAI_API_KEY` and a separate `DEEPSEEK_API_KEY` are present in ignored `.env.local`; read-only OpenAI model access to `gpt-5.6-luna` succeeded.
- Claude Code 2.1.281 uses DeepSeek V4 Pro/high for `src/app/api/**` and `src/server/**`. For Claude Code compatibility, the request model is `claude-opus-4-6`; DeepSeek's Anthropic-compatible API maps model names beginning with `claude-opus` to `deepseek-v4-pro`.
- Vercel deployment token is not present. The owner must create it in their Vercel account and add it to ignored `.env.local`; project linking/deployment remains pending.

## Claude Code launch

In VS Code, run **Terminal → Run Task → Claude Code (DeepSeek V4 Pro)** for an interactive session or **Claude backend MVP (DeepSeek V4 Pro)** for the scoped task brief. Both load a separate `DEEPSEEK_API_KEY` from ignored `.env.local` and pass credentials only to the child process. The current backend session was launched from the same repository root while the VS Code workspace remains open there.

Do not run workers concurrently on the same files. This workspace is one checkout: Astra owns frontend paths and package scaffolding, Claude owns API/server paths, and the orchestrator owns `src/domain/contracts.ts`, cross-boundary docs, review, and commits.

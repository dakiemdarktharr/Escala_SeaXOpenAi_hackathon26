# Escala MVP implementation brief

## Product outcome

Deliver a working seller support-operations dashboard inspired by Shopee Seller Centre patterns. A seller can inspect a prioritized inbox, understand why a conversation needs attention, review verified knowledge evidence, request a safe recommendation, and record an approval/edit/escalation decision. This is a seller-side decision-support tool, not an autonomous marketplace agent.

## Worker responsibilities and ownership

| Worker | Effort and assignment | File boundary |
| --- | --- | --- |
| `Frontend_Astra` (Codex) | Owns the seller inbox UI, visual system, navigation, conversation queue/detail, evidence/order context, seller decision controls, and accessible states | `src/app/page.tsx`, non-API app routes/layout, `src/components/**`, `src/styles/**`, frontend-only assets |
| `heavy_worker` (Claude Code + DeepSeek V4 Pro) | Complex backend design, policy/security boundaries, persistence invariants, and difficult API integration | Explicitly assigned backend paths, normally `src/app/api/**` and complex parts of `src/server/**` |
| `light_worker` (Claude Code + DeepSeek Flash) | Small deterministic backend slices; when finished early, review frozen Heavy checkpoints and apply only assigned localized fixes | Exact low-risk paths assigned per task; no overlap with active Heavy edits |
| Orchestrator (Codex) | Shared interfaces, request/response contracts, integration, final review, verification, and commits | `src/domain/contracts.ts`, shared/config paths, and Git operations |

Do not divide by equal ticket count. Assign difficult work to Heavy and independent low-effort work to Light only when the saved Heavy effort is worth the extra context and coordination. `src/domain/contracts.ts` remains orchestrator-owned. Workers never commit or push.

## User journeys

1. Open the seeded inbox and see counts plus sorted urgency/reason labels.
2. Select a thread and review buyer messages, product/order snapshot, and relevant verified evidence.
3. Generate or refresh a recommendation. If the model/provider fails or evidence is missing, the interface clearly offers non-automatic seller review.
4. Approve/edit a safe draft, ask one clarification, or escalate. This only records a local seller decision; never sends a buyer message or mutates a marketplace order.
5. Reopen the page and see persisted state and audit history.

## Acceptance criteria

- MongoDB Atlas backs MVP data and can be pinged through the app's health endpoint; seed data is synthetic and idempotent.
- OpenAI is called server-side only with `OPENAI_API_KEY`, model `gpt-5.6-luna`, reasoning effort `xhigh`; API secrets never enter browser bundles or logs.
- LLM output is treated as untrusted. Structured output is schema-validated and deterministic policy can downgrade/block any proposed automatic action.
- Each recommendation and seller decision has a timestamped audit record, policy version, reason/evidence IDs, and actor/action.
- The app works at desktop and mobile widths, provides clear loading/empty/error states, and uses keyboard-visible controls and reduced-motion support.
- No real Shopee integration, external sending, order mutation, or copied DOCRELAY code/assets.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass once configured. User requested the app be tested and started.
## Environment

See `.env.example`. Runtime model configuration is `OPENAI_MODEL=gpt-5.6-luna` and `OPENAI_REASONING_EFFORT=xhigh`. `OPENAI_API_KEY` belongs only to Escala runtime; the separate `DEEPSEEK_API_KEY` belongs only to Claude Code workers. A `VERCEL_TOKEN` is only needed for direct Vercel CLI use; the Git-connected project does not require it for normal deployments.

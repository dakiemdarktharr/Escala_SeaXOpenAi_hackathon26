# Escala architecture

## Request path

Synthetic/imported English thread -> normalize and redact unnecessary sensitive data -> deterministic hard-risk guard -> effective-dated BM25-style retrieval from MongoDB knowledge -> empty/conflict state or approved FAQ-template matcher -> local deterministic answer for a complete reviewed FAQ -> OpenAI Responses API only for remaining safe language work -> schema and evidence validation -> deterministic policy action -> recommendation and audit events in MongoDB -> seller-facing inbox with evidence and decision controls.

No LLM or sentiment label may authorize an action. External sending and order mutation stay disabled.

## Module responsibilities

| Module | Responsibility |
| --- | --- |
| Message adapter | Normalize synthetic fixtures or a future connector payload |
| Hard-risk guard | Detect obvious financial, order, safety, security, complaint, and commitment risks before model calls |
| Retrieval adapter | Rank active, effective knowledge locally using BM25-style lexical scoring; preserve version and source metadata |
| FAQ template matcher | Skip the model for a narrow FAQ only when the required evidence is present |
| LLM adapter | Produce schema-constrained intent and candidate wording for cases that need language work |
| Validator and policy | Validate model/evidence references, enforce risk precedence, choose the only allowed action |
| Sentiment demo | Optional offline English sentiment signal; not part of production request path |
| UI | Show queue, reasons, messages, exact evidence, draft, seller controls, and audit |
| Mongo repository | Persist versioned knowledge, recommendations, and seller decision events |

## Model/cost boundary

The OpenAI API key and model are server-only. The app uses deterministic risk and retrieval before any API call. Reviewed FAQ templates need no OpenAI call. The API is reserved for safe language work that remains after these checks. OpenAI output is untrusted and cannot supply missing seller facts, waive a hard risk, or create an external side effect.

The optional English transformer sentiment demo runs as an offline Node script. It is not downloaded or loaded in a Vercel function, avoiding per-instance model cold starts and runtime model transfer.

## Failure behavior

- No effective evidence: do not draft an answer from memory; show the limitation and route to seller review.
- Conflicting active facts: preserve the matched facts and escalate.
- Model failure or invalid output: persist a fallback reason and require seller review.
- Database failure: return a safe degraded state without logging connection details.
- Seller approval/edit/escalation: persist the local decision and audit event; do not send a message or alter an order.

## Deferred

Vector/hybrid embeddings, tenant isolation/authentication, background ingestion, live marketplace OAuth, external sends, order mutations, and persistent model-serving infrastructure need separate design and validation.
# Escala decision log

## 2026-09-24 — Start with Phase 0 and a local vertical slice

**Decision:** Create product framing, deterministic policy rules, a small versioned JSON knowledge base, synthetic messages, and validation before implementing the dashboard.

**Why:** The engineering path is feasible, but seller trust, the usefulness of urgency ranking, and live-channel assumptions are unvalidated. A narrow local slice is the smallest way to test the product behavior.

**Consequences:** The first demo will not send real messages or mutate orders. It can still demonstrate evidence, risk explanations, action recommendations, seller control, and audit intent.

## 2026-09-24 — Keep action permission deterministic

**Decision:** LLM output may interpret and draft, but hard-risk rules and grounding checks decide whether automatic action is allowed.

**Why:** Refunds, payment, cancellation, complaints, commitments, and unsupported answers create disproportionate trust and business risk.

## 2026-09-24 — Use synthetic JSON fixtures

**Decision:** Store small local JSON fixtures instead of building ingestion or vector infrastructure.

**Why:** The hackathon needs a reproducible demo and inspectable evidence references. This is faster and easier to explain than production-grade retrieval.

## Open decisions

- final web framework and component library;
- exact LLM model and structured-output adapter;
- whether seller validation will use 10–20 manually reviewed messages before the demo;
- persistence approach after the core vertical slice works.

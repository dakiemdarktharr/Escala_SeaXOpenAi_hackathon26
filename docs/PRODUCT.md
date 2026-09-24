# Escala product definition

## Product

Escala is an AI action recommender for marketplace sellers. It consolidates buyer messages, retrieves grounded information from seller knowledge, ranks urgency with visible factors, and recommends the safest next action.

It is not merely a chatbot: the product decision is **what should happen next**, while risky decisions remain behind explicit policy controls.

## Target user

The primary users are small and mid-sized marketplace sellers, store owners, seller assistants, and small customer-support teams handling a high volume of buyer messages with limited staff. The initial MVP uses synthetic/normalized inbox records rather than a live marketplace connection.

## Problem

Routine questions consume seller time, while refund, payment, cancellation, complaint, delivery-commitment, and policy-exception messages need human judgment. Existing automation either leaves too much work manual or responds too confidently and creates customer, financial, or operational risk. Sellers also need help deciding which unanswered message deserves attention first.

## Value proposition

Escala reduces repetitive support work while making risky cases more visible and safer to handle. Each recommendation shows the action, evidence, confidence or limitation, risk factors, urgency reasons, and audit history.

## Actions

- `AUTO_REPLY` — grounded low-risk FAQ with sufficient confidence and no hard-risk signal;
- `DRAFT_FOR_SELLER` — plausible answer that needs approval or editing;
- `ASK_CLARIFICATION` — one targeted question when a required fact is missing;
- `ESCALATE` — human review for hard-risk, out-of-scope, conflicting, or unsupported cases.

## MVP scenarios

The demo must show a safe FAQ, ambiguity, payment/refund risk, urgent deadline ranking, seller review, and safe fallback when evidence or the model is unavailable. See [DEMO-SCRIPT.md](DEMO-SCRIPT.md).

## Approved MVP scope

Build a Shopee Seller Centre-inspired seller-operations dashboard for Escala, focused on support triage. Use a three-pane desktop layout: prioritized conversation queue, active conversation and seller controls, and customer/order context with evidence/audit. On narrow screens, collapse the context and queue into accessible drawers. Persist synthetic demo conversations, knowledge evidence, recommendations, and seller decisions in MongoDB Atlas. Use OpenAI Responses API with `gpt-5.6-luna` and `xhigh` for structured intent extraction and draft suggestions; deterministic policy rules remain authoritative. The initial app must be usable with seed data and safe fallback if MongoDB or OpenAI is unavailable.

The user approved using DOCRELAY_MLAI2026 as an architecture/workflow reference only. Adapt general ideas such as review queues, evidence, and audit trails; do not copy its VNG interface, source code, or assets. No Shopee affiliation is implied.

## MVP non-goals

- live Shopee OAuth or multi-channel ingestion;
- real external message sending or order mutation;
- authentication, multi-tenancy, billing, or mobile apps;
- production-grade ingestion, vector infrastructure, or background workers;
- claims of validated accuracy, business impact, or urgency-model performance.

## Assumptions and validation

The main assumption is that sellers will trust Escala enough to automate routine answers and use its ranking for high-risk work. The smallest useful validation is manual review of 10–20 representative messages against human decisions. Until that happens, urgency is a transparent prototype ranking rather than a validated business metric.

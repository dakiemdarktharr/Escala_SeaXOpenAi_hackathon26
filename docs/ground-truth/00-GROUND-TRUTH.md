# Escala — project ground truth

This note is the short, stable brief for every human and coding worker. Read it before planning. The linked product, policy, architecture, and setup documents contain the detailed contracts.

## Product

Escala is an English-first seller-support operations workspace for marketplace sellers and small support teams. It prioritizes buyer conversations, retrieves seller-approved facts, and prepares the safest next step. The reference is the task-focused structure and reusable interaction patterns of Shopee Seller Centre. Escala has its own name, icon, components, and visual tokens; it is not affiliated with Shopee.

The core outcome is fewer repetitive seller actions without allowing an LLM to authorize risky actions. For a known, low-risk FAQ with complete approved evidence, use a deterministic approved answer so a seller does not have to retype it. LLMs handle only language tasks that deterministic rules and retrieved knowledge cannot safely resolve.

## Product boundaries

- The current app is a demo with synthetic inbox and knowledge records stored in MongoDB Atlas.
- ESCALA_ENABLE_EXTERNAL_SEND=false remains mandatory. No buyer message is sent and no order, payment, refund, or marketplace state is changed.
- OpenAI runs server-side for bounded language interpretation and draft assistance. It is never the final policy authority.
- No user-facing claims of measured accuracy, cost savings, urgency quality, or seller impact until representative data has been evaluated.
- The intended support dataset is English. Do not silently claim multilingual sentiment support.

## Decision order

1. Deterministic hard-risk checks run before retrieval or any model request. Payment/refund, order changes, safety/legal/security issues, complaint threats, exceptional commitments, and delivery guarantees require seller review.
2. Retrieve only active knowledge effective at the message time. Retain evidence IDs and versions.
3. Empty evidence, explicitly conflicting active facts, and required missing information must not produce a guessed answer.
4. Match a narrow, reviewed FAQ template only when every fact it uses is present in evidence. This path skips OpenAI and can recommend AUTO_REPLY.
5. Use OpenAI only for remaining safe, grounded language work. Validate its structured output and downgrade on weak confidence, unsupported claims, or any risk.
6. Sentiment is a separate, low-cost signal. It can help sort a queue or explain tone; it never clears a hard-risk flag or permits an automatic action.
7. Record a recommendation and seller decision in the audit log. Approve records a local decision only.

## Current architecture

- Next.js App Router, TypeScript/React, Node.js server routes.
- MongoDB Atlas repositories for synthetic threads, versioned knowledge, recommendations, and audit history.
- Local BM25-style English lexical retrieval in src/server/retrieval.mjs. It needs no embedding service or LLM call and filters by status and effectiveFrom.
- Reviewed deterministic FAQ templates in src/server/faq-templates.mjs.
- Authoritative risk/action rules in src/server/policy.mjs.
- OpenAI Responses API as a server-only fallback for grounded draft language.
- A separate command-line English DistilBERT sentiment demo in scripts/sentiment-demo.mjs; this is not on the production request path.
- Vercel is the deployment target. Vectors, live marketplace integrations, background ingestion, and real sending are outside the MVP.

## Worker and Git rules

- Orchestrator: plan bounded work, maintain shared contracts, review the full diff, run requested checks, and make the only commit/push.
- Frontend_Astra: frontend UI and assets only, no Git writes.
- light_worker: small independent backend changes and review of frozen Heavy checkpoints only.
- heavy_worker: complex backend and security-sensitive implementation.
- Shared files need an explicit owner. Workers do not overlap paths and never commit or push.
- The project workspace is D:\Sea X OpenAI. Never edit the old C: copy.

## Sources of detail

- [Product definition](../PRODUCT.md)
- [MVP scope](../MVP_SCOPE.md)
- [Architecture](../ARCHITECTURE.md)
- [Deterministic policy](../POLICY.md)
- [RAG knowledge base](../RAG-KNOWLEDGE-BASE.md)
- [Transformer sentiment baseline](../SENTIMENT.md)
- [Shopee design research](../DESIGN_REFERENCES_SHOPEE.md)
- [Setup and environment](../SETUP.md)
- [Agent routing workflow](../../AGENTIC_WORKFLOW.md)

## Ground-truth maintenance

When a product or safety boundary changes, update this file and the corresponding detailed contract in the same change. If source docs conflict, preserve safety boundaries above and ask the orchestrator to reconcile the documents before a worker implements the disputed behavior.
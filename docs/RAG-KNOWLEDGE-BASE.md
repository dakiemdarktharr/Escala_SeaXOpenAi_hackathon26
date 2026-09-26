# RAG knowledge base

## Current MVP retrieval

The seeded, synthetic English knowledge base is data/demo/knowledge-base.json; MongoDB stores versioned records in knowledge_base. src/server/retrieval.mjs runs local BM25-style lexical ranking over title, tags, and content. Retrieval costs no OpenAI tokens and does not call an embedding service.

The adapter accepts a message, a set of records, and the message timestamp. It returns up to four ranked evidence records with ID, version, source label, matched terms, and score:

- Only status ACTIVE records are eligible.
- A record is eligible only when effectiveFrom is at or before the message timestamp.
- A missing lexical match returns EMPTY; the caller must not ask an LLM to invent missing facts.
- Records with an explicitly shared conflictGroup and different content return CONFLICTING; the caller escalates and retains both references.
- Normal evidence returns FOUND. A retrieval score is a ranking signal, not a probability or grounding proof.

The recommendation records the exact evidence IDs and versions. The interface shows evidence text and its source label. Model output is untrusted and may cite only retrieved evidence.

## Cost-aware answer path

1. Run hard-risk policy without an LLM.
2. Retrieve local knowledge.
3. Return a safe non-automatic action on empty or conflicting evidence.
4. Match a reviewed answer template only when all required evidence IDs, versions/content facts, and narrow query conditions are present. The availability template requires the exact Blue Linen Shirt and Ho Chi Minh City facts; the care template accepts only narrow cotton-tote care questions and declines mixed-product, unsupported-condition, or instruction-override text. The template path skips OpenAI and does not ask the seller to retype a routine answer.
5. Call OpenAI only for remaining safe language work. Treat provider failure as a seller-review fallback.

Template rules currently cover the synthetic size-M availability plus delivery FAQ and cotton-tote care FAQ. They are examples for the small demo corpus, not generalized automation coverage. External send remains disabled; AUTO_REPLY creates a local recommendation and never sends a message.

## Expansion path

Keep MongoDB as the source of versioned knowledge. When the corpus grows beyond reliable lexical matching, compare hybrid BM25 plus embeddings against the same held-out English support set. Pin an embedding model and index version; filter by tenant/source/status/effective date before retrieval; evaluate recall@k, evidence precision, conflict detection, and answer grounding. Do not add vector infrastructure until measured retrieval failures justify its operational and token cost.

## Knowledge authoring

Each record has id, version, title, type, status, effectiveFrom, sourceLabel, content, tags, and updatedAt. Optional conflictGroup explicitly joins facts that cannot both be true. Archive superseded facts; do not leave old and new versions simultaneously active unless a deliberate conflict needs seller resolution.

Demo records are synthetic and are not official marketplace policies.

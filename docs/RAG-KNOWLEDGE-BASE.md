# RAG knowledge base

## MVP approach

The MVP uses a small local JSON knowledge base at [data/demo/knowledge-base.json](../data/demo/knowledge-base.json). It is intentionally not a production ingestion platform. Each document is short, realistic, versioned, and attributable to a source type such as store FAQ, product facts, shipping rules, policy, approved response, or seller constraint.

## Evidence model

Each document has:

```text
id, version, title, type, status, effectiveFrom, sourceLabel,
content, tags, updatedAt
```

An answer or recommendation retains the document `id` and `version` as evidence references. A UI evidence panel should show the title, source label, version, and the exact supporting snippet.

## Retrieval contract

The planned local adapter accepts a normalized message and returns:

```text
{
  evidence: [{ id, version, title, snippet, relevanceReason }],
  retrievalStatus: "FOUND" | "EMPTY" | "CONFLICTING"
}
```

Retrieval is a support signal, not permission to answer. The grounding check must verify that claims in a candidate response are supported by returned evidence.

## Versioning and conflicts

Only documents with `status=ACTIVE` and an effective date at or before the message timestamp should be eligible. If active documents conflict, preserve both references, mark retrieval as `CONFLICTING`, and block automatic reply until a seller resolves it.

## Fallback behavior

- `FOUND` plus grounded low-risk answer: eligible for policy evaluation;
- `EMPTY`: no invented answer; ask for clarification or escalate/draft for seller review;
- `CONFLICTING`: show both evidence references and escalate or require seller review;
- model or grounding failure: retain the failure reason and use a safe non-automatic action.

## Demo knowledge documents

The fixture includes product facts, shipping rules, returns/exchange policy, payment-review guidance, an approved availability example, a store FAQ, and seller-specific constraints. These are synthetic demo content and not official marketplace policy.

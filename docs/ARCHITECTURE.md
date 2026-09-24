# Escala architecture

## System flow

```text
Seeded/imported message
  → normalize thread and redact sensitive content
  → structured intent extraction
  → retrieve versioned knowledge with evidence IDs
  → generate candidate answer or clarification
  → check grounding and confidence
  → deterministic risk and urgency engines
  → deterministic policy action
  → seller-facing recommendation
  → audit event
```

The LLM may interpret language and draft text. It must not bypass the deterministic policy engine or execute an external side effect.

## Module responsibilities

| Module | Responsibility | Boundary |
| --- | --- | --- |
| Message adapter | Normalize local fixtures or future connector payloads | No live connector in MVP |
| Redaction/normalization | Normalize thread fields and remove unnecessary sensitive data | Does not decide action |
| LLM adapter | Structured intent, entities, sentiment hints, and candidate draft | Mock fallback required; output is untrusted |
| RAG adapter | Retrieve versioned documents and return evidence IDs/snippets | Empty retrieval is a safe state |
| Grounding check | Verify draft claims are supported by retrieved evidence | Failed check cannot auto-send |
| Risk engine | Detect hard-risk categories and conflicts | Deterministic and independently testable |
| Urgency engine | Rank visible factors such as deadline, payment, waiting time, and complaint language | Prototype ranking, not validated metric |
| Policy & Action Engine | Apply precedence rules and choose one allowed action | Final authority for action permission |
| UI | Show queue, reasons, evidence, draft, controls, and audit | No policy decisions in components |
| Audit log | Record recommendation, evidence, policy reasons, and seller decision | Every recommendation gets an event |

## Core records

Each recommendation should retain:

- message and thread IDs;
- normalized intent and extracted risk signals;
- retrieved evidence IDs and knowledge-base versions;
- grounding/confidence result and any model fallback reason;
- urgency level plus human-readable factors;
- exactly one recommended action;
- seller approval/edit/escalation decision;
- timestamps and policy version.

## Data flow and side-effect boundary

MongoDB Atlas stores seeded synthetic threads, knowledge evidence, recommendations, and seller decisions. Use a repository boundary so fixtures remain available for development and safe fallback. `ESCALA_ENABLE_EXTERNAL_SEND=false` is mandatory; the MVP must not mutate marketplace orders or send buyer messages. OpenAI handles structured language interpretation and draft suggestions only; deterministic policy retains action authority.

## Failure behavior

If retrieval is empty, evidence conflicts, confidence is low, the model fails, or grounding cannot be established, Escala must not invent an answer. It should show the limitation and route the message to clarification, seller draft, or escalation according to the deterministic policy.

## Deferred infrastructure

No authentication, multi-tenancy, live marketplace OAuth, vector store, queue, background worker, or billing is in MVP scope. Vercel is the target deployment platform once the required user-managed deployment token is available.

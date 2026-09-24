# Escala

**Escala — AI Action Recommender for Marketplace Sellers**

> Scale seller support, not seller risk.

Repository: [github.com/dakiemdarktharr/Escala_SeaXOpenAi_hackathon26](https://github.com/dakiemdarktharr/Escala_SeaXOpenAi_hackathon26)

Escala is a hackathon prototype for marketplace sellers. Its intended workflow recommends routine replies, seller review, or escalation for risky buyer messages. The current implementation evaluates manually supplied signals; it does not interpret messages, generate replies, or send them.

## Current status

**Implemented: the deterministic Determination Engine and its tests.** Initial inspection found only this README; previously linked product documents, demo data, and upstream/downstream modules were absent from the checkout.

The current slice is:

```text
Synthetic normalized input → deterministic policy
→ action + separate risk/urgency/grounding + reasons + returned audit event
```

The three recommendations are `AUTO_REPLY`, `DRAFT_FOR_REVIEW`, and `ESCALATE`. Hard-risk signals take precedence over model output. Missing information is handled through seller review. All action names are recommendations only; there are no external side effects or sending modules.

## Run the policy tests

Prerequisite: Node.js 20 or newer. No dependencies need to be installed.

```powershell
npm test
```

`npm run validate:demo` is an alias for the same policy tests. It does not validate a complete product demo. If PowerShell blocks the npm script shim, use `npm.cmd test` or `node --test`.

## Contract and files

- [Engine contract, precedence, and assumptions](docs/DETERMINATION-ENGINE.md)
- [Pure policy function](src/determination-engine.js)
- [Policy tests](test/determination-engine.test.js)
- [16 synthetic scenario fixtures](test/fixtures/determination-cases.json)

Import `determineAction` from `./src/determination-engine.js` and supply the documented input. IDs and evaluation time come from the caller, so repeated evaluation of identical input returns identical output. Each recommendation includes an audit event; persistence and seller-decision capture are not implemented.

## Synthetic evidence and assumptions

Fixtures cover routine FAQ, ambiguity, payment/refund risk, delivery deadlines, complaint/cancellation, missing or conflicting evidence, model failure/unavailability, low confidence, disabled automation, model-reported high risk, and unknown intent. Message text is illustrative; only each fixture's `input` enters the engine. `expected` fields are test oracles, including any added later under `data/demo/messages.json`.

Model classifications, evidence confidence, source IDs, and risk observations are manually seeded test inputs. Source IDs are stubs; no knowledge base, retrieval, model adapter, or connector exists here. Tests verify policy behavior, not interpretation accuracy.

Prototype assumptions: payment, refund, complaint, and cancellation require escalation; only `faq` may qualify for automatic reply; both confidence thresholds are 0.90. Deadlines at or below zero hours are critical, through 24 hours are high urgency, and later deadlines are normal. Missing deadlines have unknown urgency. These choices are unvalidated, and risk, urgency, grounding, and action blockers remain separate.

The main product assumption is that sellers will trust routine automation and the ranking of risky messages. The smallest useful validation remains manual review of 10–20 representative seller messages against human decisions; that review has not occurred.

## What is real, mocked, synthetic, and not implemented

| Area | Current status |
| --- | --- |
| Deterministic policy and contract tests | Implemented locally, independently of any model |
| Message examples and input observations | Synthetic fixtures |
| Recommendation audit event | Returned with every recommendation; no storage |
| Marketplace integration and message sending | Not implemented |
| Knowledge base, retrieval, model interpretation/drafting | Not implemented |
| Seller UI, decisions, and audit timeline | Not implemented |
| Accuracy, urgency quality, and adoption | Unvalidated; no production claims |

## Compliance boundary

Escala is a new build in this workspace. Do not reuse DOCRELAY or SAND source code or artifacts.

## Scope discipline

Keep the engine deterministic and independently testable, and never allow model output to bypass hard-risk rules. Read the contract before changing policy, preserve the distinction between facts, assumptions, and plans, and verify the minimum implemented slice before expanding scope.

The broader seeded-message/knowledge-base demo is future work. Full-product implementation, RAG, UI, seller messaging, and external side effects remain outside this task. Prefer synthetic connectors for a future demo, keep external side effects disabled by default, and capture audit events for every recommendation and seller decision when those workflows exist.

Authentication, multi-tenancy, live channel integrations, mobile clients, analytics dashboards, background workers, billing, and production reliability work remain deferred. Do not claim an upstream or downstream module exists without checking the workspace.

# Determination Engine contract

## Scope and evidence

The first implementation is a deterministic policy function, `determineAction(input)`, with local synthetic fixtures and tests. It returns one of three recommendations: `AUTO_REPLY`, `DRAFT_FOR_REVIEW`, or `ESCALATE`. These names describe recommended actions; calling the engine does not draft or send a message.

Repository inspection found only the original README. Its linked product documents, knowledge base, message fixtures, and modules were absent. This contract therefore defines a new interface rather than adapting an existing upstream or downstream module. Retrieval, model interpretation, seller decisions, UI, connectors, and audit persistence are outside this slice.

The thresholds, intent mapping, and urgency rules below are prototype assumptions. Synthetic tests can establish that the implementation follows this contract. They cannot establish recommendation accuracy, seller trust, business impact, or production reliability. No human review of representative seller messages has been completed.

## Input

The caller supplies observations and audit identity. The engine does not extract intent, risk, or deadlines from raw message text and does not query a knowledge base or model.

```js
{
  messageId: "message-001",
  evaluationId: "evaluation-001",
  evaluatedAt: "2026-09-24T00:00:00.000Z",
  hardRiskFlags: [],
  hoursUntilDeadline: null,
  evidence: {
    status: "GROUNDED",
    confidence: 0.95,
    sourceIds: ["kb-shipping-001"]
  },
  model: {
    status: "OK",
    intent: "faq",
    risk: "LOW",
    confidence: 0.95
  },
  automationAllowed: true
}
```

| Field | Contract |
| --- | --- |
| `messageId`, `evaluationId` | Required, nonblank strings. The caller supplies stable identity and a distinct evaluation ID when recording a new evaluation. |
| `evaluatedAt` | Required canonical ISO UTC timestamp, exactly in the form produced by `Date.prototype.toISOString()`. The engine does not read the clock. |
| `hardRiskFlags` | Required array containing only `PAYMENT`, `REFUND`, `COMPLAINT`, or `CANCELLATION`. These are caller-supplied trusted policy signals, separate from model output. |
| `hoursUntilDeadline` | Required finite number, or `null` when no deadline is known. Zero means due now; negative values mean overdue. |
| `evidence.status` | `GROUNDED`, `MISSING`, or `CONFLICTING`. |
| `evidence.confidence` | Finite number in the inclusive range `[0, 1]`. |
| `evidence.sourceIds` | Array of nonblank strings. At least one ID is required for automatic recommendation. |
| `model.status` | `OK`, `FAILED`, or `UNAVAILABLE`. Failed and unavailable results require only `status`. |
| `model.intent` | For `OK`: `faq`, `ambiguous`, `payment`, `refund`, `delivery_deadline`, `complaint`, `cancellation`, or `unknown`. |
| `model.risk` | For `OK`: `LOW`, `MEDIUM`, or `HIGH`. |
| `model.confidence` | For `OK`: finite number in the inclusive range `[0, 1]`. |
| `automationAllowed` | Required boolean; only explicit `true` allows `AUTO_REPLY`. |

The schema is closed. Unexpected fields, including fixture expectations, are invalid decision inputs. Unexpected model fields make that model result malformed. Do not coerce strings into numbers or booleans, or silently interpret unrecognized enum values.

Missing or malformed audit identity causes a `TypeError`, with no recommendation or recommendation event returned. Without valid identity, the engine cannot return an attributable recommendation. Invalid decision fields instead produce validation issues and blockers that prevent automatic action. Recognized risk signals remain effective even when another decision field is invalid.

## Policy precedence

1. Validate audit identity. Reject an invalid identity before returning a recommendation.
2. Collect recognized trusted hard-risk flags. Any recognized flag forces `ESCALATE`, including when evidence, model output, or another decision field is malformed.
3. Inspect recognizable model signals when its status is `OK`. Model risk `HIGH`, or intents `payment`, `refund`, `complaint`, or `cancellation`, also force `ESCALATE`. These signals may raise risk even when another field in the same model result is invalid. Model output cannot clear or lower a trusted hard-risk signal.
4. Collect validation and action blockers. Invalid input, missing or failed model results, model risk `MEDIUM`, unsupported or ambiguous intent, insufficient or conflicting evidence, confidence below threshold, or disabled automation prevent `AUTO_REPLY`. In the absence of escalation, they yield `DRAFT_FOR_REVIEW`.
5. Recommend `AUTO_REPLY` only when the input is valid, trusted hard-risk flags are empty, the model status is `OK`, intent is `faq`, risk is `LOW`, both model and evidence confidence are at least `0.9`, evidence is `GROUNDED` with at least one source ID, and `automationAllowed` is `true`.

The only automatic intent is `faq`. A `delivery_deadline` intent is reviewed, while numeric deadline information determines urgency independently. `ambiguous` and `unknown` intents are reviewed. Missing information is expressed through review reasons and blockers; it is not a fourth action outcome.

Escalation takes precedence over review blockers. The output still exposes relevant blockers and validation issues so that the recommendation remains explainable.

## Separate decision dimensions

Risk represents recognized risk signals. Trusted hard-risk flags and model high-risk signals yield `HIGH`; model `MEDIUM` risk remains distinct from missing evidence or disabled automation. Unusable risk information is represented by `UNKNOWN`, rather than being treated as safe. Evidence quality and action restrictions are not risk categories.

Urgency uses only the numeric deadline observation:

| `hoursUntilDeadline` | Urgency |
| --- | --- |
| Finite number `<= 0` | `CRITICAL` |
| Finite number `> 0` and `<= 24` | `HIGH` |
| Finite number `> 24` | `NORMAL` |
| `null` or malformed | `UNKNOWN` |

A malformed deadline additionally blocks automatic action. An unknown deadline supplied as `null` is valid input. Urgency cannot lower risk or bypass an action blocker, and a deadline alone does not force escalation.

Grounding reports evidence status, confidence, and source IDs. Invalid evidence is represented by status `INVALID`. Source IDs are references supplied by the caller; this engine neither fetches them nor verifies their contents. A `GROUNDED` label alone is insufficient for automatic action if confidence is below `0.9` or there are no source IDs.

## Output and audit event

```js
{
  action: "AUTO_REPLY", // or DRAFT_FOR_REVIEW or ESCALATE
  risk: {
    level: "LOW", // LOW | MEDIUM | HIGH | UNKNOWN
    hardRiskFlags: [],
    modelRisk: "LOW"
  },
  urgency: {
    level: "UNKNOWN", // UNKNOWN | NORMAL | HIGH | CRITICAL
    hoursUntilDeadline: null
  },
  grounding: {
    status: "GROUNDED", // GROUNDED | MISSING | CONFLICTING | INVALID
    confidence: 0.95,
    sourceIds: ["kb-shipping-001"]
  },
  blockers: [],
  reasons: [{ code: "...", message: "..." }],
  validationIssues: [],
  auditEvent: { /* recommendation.created event */ }
}
```

`blockers` contains machine-readable reasons automatic action is unavailable. `reasons` contains stable codes and readable explanations of the recommendation and relevant supporting signals. `validationIssues` describes invalid decision inputs. Consumers must use the actual `action` field, rather than infer an action from reason text or a single signal.

Every returned recommendation includes one `recommendation.created` audit event. Its `eventId` is the supplied `evaluationId`, timestamp is the supplied `evaluatedAt`, and `policyVersion` is `determination-v1`. The event carries message/evaluation identity and a snapshot of the decision and normalized supporting signals. It does not recursively contain itself.

The function does not persist the event. Any future consumer must persist it when recording a recommendation and must separately capture every seller decision as an audit event. This slice has no seller-decision workflow or storage module.

For identical inputs, the engine returns equivalent output, including event identity and timestamp. It does not mutate caller data or read storage, the network, environment configuration, the clock, or random state. It does not call a model, send messages, or perform other external side effects.

## Synthetic scenarios and verification

The local fixture set in `test/fixtures/determination-cases.json` contains 16 synthetic scenarios:

| Scenario | Expected action |
| --- | --- |
| Grounded routine FAQ with high confidence | `AUTO_REPLY` |
| Ambiguous request | `DRAFT_FOR_REVIEW` |
| Trusted payment risk | `ESCALATE` |
| Trusted refund risk | `ESCALATE` |
| Delivery deadline request | `DRAFT_FOR_REVIEW` |
| Trusted complaint risk | `ESCALATE` |
| Trusted cancellation risk | `ESCALATE` |
| Missing grounding evidence | `DRAFT_FOR_REVIEW` |
| Conflicting grounding evidence | `DRAFT_FOR_REVIEW` |
| Model failure | `DRAFT_FOR_REVIEW` |
| Model unavailable | `DRAFT_FOR_REVIEW` |
| Low model confidence | `DRAFT_FOR_REVIEW` |
| Low evidence confidence | `DRAFT_FOR_REVIEW` |
| Automation disabled | `DRAFT_FOR_REVIEW` |
| Model reports high risk | `ESCALATE` |
| Unknown intent | `DRAFT_FOR_REVIEW` |

Fixture expectations are test oracles, not input fields. Each fixture keeps its `input` and `expected` objects separate; the engine receives only `input`. This also applies to expected fields in any future `data/demo/messages.json`; that file is absent here. Message text and source IDs are illustrative synthetic stubs, with no actual knowledge base behind them. Fixtures are not evidence of an implemented connector, retrieval pipeline, or model adapter.

Tests should also verify precedence across combined conditions, model signals that raise but never lower hard risk, confidence boundaries at and around `0.9`, urgency boundaries at zero and 24 hours, negative deadlines, malformed values, unknown fields, blank sources, missing audit identity, deterministic output, input immutability, and the returned audit snapshot. Each fixture asserts the recommended action and the relevant explanatory dimensions; boundary tests assert the independent rules directly.

## Assumptions and future validation

- Payment, refund, complaint, and cancellation signals all warrant escalation in this prototype. This conservative mapping is an assumption, not an evaluated seller preference.
- `faq` is the sole intent allowed automatic action, and both confidence thresholds are `0.9`. Confidence values are supplied observations, not calibrated probabilities verified by this engine.
- A 24-hour deadline threshold and overdue/zero critical urgency are transparent prototype rules, not validated business metrics.
- The caller is responsible for producing trusted hard-risk observations independently of any model classification. No such producer is implemented by this policy slice.
- The next evidence step is manual review of 10-20 representative seller messages, comparing engine recommendations with human decisions. This remains future work.

The engine contract and tests must be verified before implementing the rest of the vertical slice. Live integrations, RAG, UI, real sending, authentication, multi-tenancy, mobile clients, analytics, and production reliability work remain deferred.

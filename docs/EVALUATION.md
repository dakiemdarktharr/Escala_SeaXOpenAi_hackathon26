# Offline routing evaluation

Run from the project root:

```powershell
npm run eval:policy
node scripts/eval/evaluate-policy.mjs --json
```

The JSON form includes one aggregate `metrics` object and a `results` array with every case's identifier, expected route, observed route, pass/fail, retrieval status, evidence IDs, and deterministic draft when applicable. It can be redirected to a file or consumed by a dashboard. Exit code `0` means all fixture expectations passed; `1` means at least one mismatch. Invalid fixtures throw an error. No key, `.env.local`, database, downloaded model, or internet connection is needed.

## What is measured

The harness imports the production `retrieveKnowledge`, `detectHardRisk`, and `matchFaqTemplate` pure functions. It composes the pre-model routing order from `inbox-service.ts`: hard risk, conflicting or empty evidence, then eligible FAQ. An unmatched message becomes `MODEL_OR_SELLER_REVIEW`; evaluation stops before any OpenAI candidate or seller decision. The harness does not execute the database-backed service or prove end-to-end integration. Keep the composition synchronized when the service routing changes.

`AUTO_REPLY` means a reviewed reply is eligible inside Escala. No message is sent externally. `NO_AUTO_REPLY` is an expected abstention assertion: escalation or deferred model/seller review both pass. It does not claim an unsupported message has been resolved or definitely escalated.

The fixture file is [english-cases.json](../data/eval/english-cases.json). All 28 cases are hand-authored synthetic English examples, with expectations written before evaluating them:

| Group | Cases | Purpose |
| --- | ---: | --- |
| Supported FAQ | 5 | Two existing catalog FAQ families and wording variations |
| Hard risk | 8 | Refund, order changes, deadline, complaint, health, security, discount, and mixed intent |
| Unsupported | 9 | Missing/wrong product, wrong destination, mixed products, unverified care, injection, SaaS SSO/retention, unknown product |
| Evidence guards | 6 | Empty, archived, future, conflicting, missing-approved, and changed-version knowledge |

The clock is pinned to `2026-10-31T10:00:00+07:00` because the synthetic catalog begins on October 1. This does not imply that those future-dated facts were effective earlier. Mutations are applied to copies in memory; the demo catalog is unchanged. SaaS cases deliberately have no matching SaaS knowledge base and should abstain. They do not establish SaaS answer coverage.

## Metric definitions

Every metric returns `numerator`, `denominator`, and `percent`. A zero denominator yields `null` percent.

| Metric | Numerator / denominator |
| --- | --- |
| `fixtureExpectationPassRate` | Cases satisfying their fixture assertion / all 28 cases. `NO_AUTO_REPLY` passes for either escalation or deferred model/seller review, so this is not exact route accuracy. |
| `supportedFaqCoverage` | Supported FAQ cases eligible for deterministic reply / 5 supported FAQ cases |
| `preModelDecisionRate` | Cases ending in a deterministic reply or escalation / all 28 cases |
| `deterministicFaqRate` | Cases eligible for a deterministic reply / all 28 cases |
| `hardRiskEscalation` | Hard-risk cases escalated / 8 hard-risk cases |
| `unsupportedAbstention` | Unsupported cases not automatically answered / 9 unsupported cases |
| `evidenceGuardPass` | Evidence mutation cases meeting their expectation / 6 evidence mutation cases |
| `falseAutoReply` | Non-auto expected cases incorrectly eligible for auto reply / 23 non-auto expected cases |

`openaiCallsMadeByEvaluator` is always zero: the evaluator contains no model client. It is not an API-savings percentage. The pre-model decision rate includes escalations and therefore must not be presented as the self-service resolution rate. A higher deterministic FAQ rate is harmful if false auto replies also rise; always present the error rate beside coverage.

## Interpretation and follow-up

This is a small regression/challenge suite, not a held-out benchmark, live performance result, statistically reliable safety estimate, or proof of reduced seller handling time. Fixes may be tuned to these visible cases. Results depend on the code and catalog at the tested Git revision; retain the JSON alongside that revision when presenting it. Do not claim dollar savings, latency reductions, or an LLM-only quality comparison from this offline run.

Before a pilot, collect de-identified English support messages with permission, split by conversation into development and held-out sets, and have independent reviewers label valid evidence, required facts, intended answer, and allowed action. Include ordinary paraphrases, multilingual/code-switched inputs, negation, adversarial instructions, multiple products, stale documents, and genuinely conflicting knowledge. Record policy/catalog version and reviewer disagreements.

A later controlled comparison should run the same held-out set through Escala and a documented LLM-only baseline with the same available knowledge and action restrictions. Record actual input/output tokens, API calls, prices at evaluation time, end-to-end latency, unsupported claims, incorrect auto replies, correct escalations, and human editing effort. Do not send private buyer messages to an external API without the appropriate authorization.

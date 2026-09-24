# Master Handoff Prompt — Escala

> Copy the content below into a new agent/thread to initialize the Escala project.
> This document is project context and setup instruction. It is not a license to reuse
> code or artifacts from any previous repository.
> The repository files are the source of truth for the current implementation state.
> When this handoff and the repository disagree, inspect the repository, preserve the
> safer behavior, and record the discrepancy as an assumption instead of inventing
> an existing interface.

---

## 0. Agent role

You are the setup and build agent for **Escala**, a hackathon prototype for marketplace sellers.

Your immediate implementation task is the first narrow vertical slice: build the
deterministic **Determination Engine** and its tests. The repository is still in
Phase 0, so first inspect the workspace and report what actually exists. Do not
assume that an upstream LLM/RAG pipeline, downstream UI, shared schema, or test
framework already exists. If it does not exist, expose a clean interface and state
the integration boundary rather than inventing a module or pretending that it is
already wired.

Work in small, reversible steps. Keep the product demoable within a one-day hackathon. Prefer a narrow working vertical slice over a broad but incomplete platform.

When facts are uncertain, mark them as assumptions. Do not invent live marketplace access, real seller adoption, production accuracy, or official API permissions.

Before coding, briefly report:

1. the repository structure and current implementation status;
2. existing models, schemas, enums, services, tests, and naming conventions found;
3. the upstream and downstream interfaces that really exist, or a clear statement that they do not exist yet;
4. the files you plan to create or modify and how the Determination Engine will integrate;
5. assumptions and unresolved contract questions.

Do not make an LLM/API/network call as part of the Determination Engine or its tests.

## 1. Product identity

- Product name: **Escala**
- Product category: AI action recommender for marketplace seller operations
- Suggested descriptor: **Escala — AI Action Recommender for Marketplace Sellers**
- Suggested tagline: **Scale seller support, not seller risk.**
- Primary language for the demo: English UI is acceptable; Vietnamese seller-facing text is welcome.
- Primary interface for the hackathon: a responsive web dashboard.

## 2. One-sentence product definition

Escala consolidates seller messages, retrieves grounded answers from store knowledge, ranks urgency, and recommends the safest next action: automatically reply, prepare a draft for seller approval, ask for clarification, or escalate to a human.

Escala is not merely a chatbot. Its core value is deciding **what should happen next** while keeping risky decisions under explicit policy control.

## 3. Hackathon context and hard constraints

The public competition information currently states:

- Event: Sea × OpenAI Regional Codex Hackathon — Vietnam 2026.
- Event date: 31 October 2026, 08:30–21:00.
- Venue: Shopee Vietnam Office, Ho Chi Minh City.
- Teams: 3–4 members; maximum 40 teams.
- Hacking window: approximately 10:00–17:00 on the event day.
- Teams may prepare ideas beforehand, but all building must happen on the event day.
- **Pre-built code or existing projects must not be submitted.**
- Evaluation emphasizes problem framing, quality of build, depth of thinking, and effective use of Codex.
- Build directions: Autonomous & Adaptive AI, AI-Native Products & Operations, and Deep Domain AI.

Official source: https://codexhackathon.sea.com/

Treat the official event page as the source of truth if any detail in this handoff becomes stale.

## 4. Prior experience boundary

The team may reference these public projects as experience and inspiration:

- DOCRELAY_MLAI2026: policy-based technical-support workflow, redaction, structured intake, deterministic policy, review, escalation, and audit.
  - https://github.com/dakiemdarktharr/DOCRELAY_MLAI2026
- SAND: multi-model workflow, tool approval, durable state, MCP integration, and audit receipts.
  - https://github.com/dakiemdarktharr/SAND

These repositories are **not** the Escala codebase. Do not clone, fork, copy, port, rename, reuse, or submit their:

- source code;
- UI components or layouts;
- API routes or database schema;
- prompts, fixtures, datasets, or deployment;
- README text or generated artifacts;
- existing product as a renamed hackathon submission.

Escala may reuse the general engineering lessons and conceptual abstractions, but its code, UI, data, workflow details, and demo must be created for Escala and built from scratch during the event. If asked to reuse an existing artifact, stop and flag the compliance risk.

Recommended disclosure in the application:

> Escala is a new product that will be built from scratch during the hackathon. Its design is informed by our previous experience with policy-based support workflows, but we will not reuse any existing source code, UI, database, dataset, deployment, or project artifacts.

## 5. Problem statement

Marketplace sellers receive a continuous stream of buyer messages, often at all hours and sometimes through multiple channels. Many messages are repetitive and answerable from existing product, store, shipping, and return information. Other messages involve refunds, payment, cancellation, complaints, delivery commitments, account issues, or policy exceptions and require careful human judgment.

Existing auto-reply systems often fail in one of two ways:

1. They answer too little and leave sellers with unnecessary manual work.
2. They answer too confidently and create customer, financial, or operational risk.

Sellers also need help deciding which unanswered messages deserve attention first when they return after several hours.

## 6. Target users

Primary users:

- small and mid-sized Shopee or marketplace sellers;
- store owners who handle customer messages themselves;
- small customer-support or operations teams;
- seller assistants who need a prioritized queue.

The hackathon demo should use a normalized inbox and synthetic/imported conversations. Do not depend on a live Shopee integration unless the team has explicit permission and enough time.

## 7. Core workflow

The canonical Escala workflow is:

```text
Message ingestion
  → normalization and thread merge
  → privacy/redaction checks
  → LLM structured extraction
  → knowledge retrieval with evidence
  → candidate answer generation
  → confidence and grounding checks
  → deterministic risk and urgency engines
  → policy-based action recommendation
  → auto-reply, seller draft, clarification, or escalation
  → audit log
  → seller feedback and controlled policy/knowledge updates
```

The workflow must clearly show that the LLM interprets and drafts, while the deterministic engine decides what Escala is allowed to do.

In the current repository, the LLM adapter, retrieval adapter, grounding checker,
policy runtime, UI, and audit log are planned modules, not existing implementations.
The local JSON fixtures are available, but their `expected*` fields are test/demo
oracles, not the structured runtime output of an upstream model. The Determination
Engine must consume structured signals and must not parse raw customer text.

## 8. Action model

Every message must end in one of these actions:

### AUTO_REPLY

Allowed only when:

- the intent is a routine FAQ;
- relevant knowledge-base evidence was retrieved;
- the draft is grounded in that evidence;
- confidence passes the configured threshold;
- no high-risk signal is present;
- the answer does not create an unauthorized promise, refund, discount, or commitment.

### DRAFT_FOR_SELLER

Use when the answer is probably safe but needs seller confirmation, the confidence is medium, or the message contains a mild ambiguity.

Show:

- suggested response;
- retrieved evidence;
- confidence;
- detected intent;
- reason seller approval is required.

### ASK_CLARIFICATION

Use when the message is missing a necessary order, product, quantity, date, or other fact. Generate one short targeted question instead of guessing.

### ESCALATE

Use for high-risk, out-of-scope, or conflicting cases. Escalation should include risk factors, urgency, supporting evidence, and a suggested next action.

## 9. Determination Engine — implementation contract

Use a small, clearly separated policy module named **Escala Determination Engine**
or **Escala Policy & Action Engine**, following the repository's naming conventions
if they are introduced later. The public entry point should be simple:

```text
result = determine(input)
```

Keep these responsibilities separate and independently testable:

```text
determine_risk(input)
determine_urgency(input)
determine_action(input, risk, urgency)
determine(input)
```

Do not create duplicate schemas if an equivalent shared model is found. Because the
current Phase 0 repository has no runtime domain models, create the smallest typed
contract needed for this engine in the domain/policy area selected after inspection.
Do not create RAG, UI, connector, or LLM modules merely to satisfy this task.

### 9.1 Input contract

Adapt the contract to real repository types when they exist. Otherwise the engine
needs equivalent fields:

```ts
type RiskSignals = {
  money: boolean;
  account: boolean;
  security: boolean;
  legal: boolean;
  policy_exception: boolean;
  complaint: boolean; // an escalatory/public-complaint signal, not every ordinary complaint
};

type DeterminationInput = {
  intent: string;
  entities: Record<string, unknown>;
  risk_signals: RiskSignals;
  grounded: boolean;
  confidence: number;
  contradiction: boolean;
  missing_information: string[];
  waiting_minutes: number;
  repeat_messages: number;
  deadline_minutes?: number | null;
  order_status?: string | null;

  // These optional fields make planned failure states explicit when available.
  retrieval_status?: "FOUND" | "EMPTY" | "CONFLICTING";
  model_status?: "AVAILABLE" | "FAILED";
  external_side_effect_requested?: boolean;
  unauthorized_commitment?: boolean;
};
```

The engine accepts structured pipeline output only. It must not receive or parse a
raw buyer message. A failed model must not be represented ambiguously as an ordinary
successful extraction with `intent: null`; normalize that state to an explicit
`model_status: "FAILED"` and a safe string such as `intent: "unknown"` at the
adapter boundary. The existing fixture's `expectedIntent: null` is an oracle for
that failure case, not a required engine input.

Validate inputs and fail loudly for invalid values. At minimum:

- `confidence` must be finite and in `[0, 1]`;
- `waiting_minutes` and `repeat_messages` must be integers `>= 0`;
- `deadline_minutes`, when present, must be an integer `>= 0`;
- required booleans and collections must have the expected shape;
- do not silently coerce invalid values or turn unknown intent into a low-risk intent.

### 9.2 Output contract

Return one structured, auditable result:

```ts
type DeterminationResult = {
  risk: "LOW" | "MEDIUM" | "HIGH";
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  action: "AUTO_REPLY" | "DRAFT_FOR_SELLER" | "ESCALATE" | "ASK_CLARIFICATION";
  reason_codes: string[];
};
```

Use machine-readable reason codes, not only free-form explanations. Keep the result
deterministic: the same valid input must always produce the same result and code
ordering. If the surrounding model later needs human-readable explanations, derive
them from these codes in a separate layer.

The engine must override the LLM when a hard-risk condition is present.

### 9.3 Risk determination

Risk means: “If the AI responds or acts incorrectly, how serious could the
consequence be?” Risk is not urgency and must not be calculated by averaging scores.

Hard-risk signals must override safe intent or confidence signals. At minimum, the
following produce `HIGH` risk or an equivalent hard-risk block:

- refund, payment, charge, or financial dispute;
- cancellation or order-state mutation;
- legal, safety, or regulatory complaint;
- account, identity, credential, or security issue;
- request for an exceptional discount, compensation, or commitment;
- customer threatening escalation or public complaint;
- direct financial action or `risk_signals.money == true`;
- `risk_signals.account`, `security`, `legal`, or `policy_exception` equal to `true`;
- an unauthorized external side effect or commitment.

Suggested high-risk intents include:

- `refund_request`;
- `payment_dispute`;
- `compensation_request`;
- `legal_complaint`;
- `account_security`;
- `policy_exception`;
- `cancellation_request` when cancellation/order mutation is requested;
- the current fixture variants `payment_dispute_and_refund`, `delivery_deadline_and_cancellation`, and `cancellation_and_complaint` when their hard-risk signal is present.

Suggested medium-risk intents include:

- `return_request`;
- `return_or_exchange`;
- `delivery_complaint`;
- `order_issue`;
- ordinary `complaint` without a public/escalation threat;
- `compatibility_question` when it is not otherwise documented as a hard-risk case.

Suggested low-risk intents include:

- `faq`;
- `product_information`;
- `stock_check`;
- `shipping_faq`;
- `payment_faq` when it is informational and not a dispute or financial action;
- `store_policy_faq`;
- the current fixture variant `product_and_shipping_faq`.

Unknown or unclassified intents must use `MEDIUM` as the safe default and emit
`UNKNOWN_INTENT`. Do not default unknown input to `LOW`.

Important distinction: missing evidence, failed grounding, low confidence, and
contradiction are policy blockers, but they do not need to be reinterpreted as the
customer's business risk. Preserve the independent `risk` result and let the policy
stage use these blockers to select a non-automatic action.

Required risk reason-code examples:

- `LEGAL_SIGNAL`, `SECURITY_SIGNAL`, `ACCOUNT_SIGNAL`, `MONEY_RELATED_ACTION`;
- `POLICY_EXCEPTION`, `ORDER_STATE_MUTATION`, `PUBLIC_COMPLAINT_THREAT`;
- `HIGH_RISK_INTENT:<intent>`;
- `MEDIUM_RISK_INTENT:<intent>`;
- `LOW_RISK_INTENT:<intent>`;
- `UNKNOWN_INTENT`.

### 9.4 Urgency determination

Urgency means: “How soon does this case need attention?” It remains independent of
risk. A low-risk case may still be critical because of a deadline.

Use deterministic thresholds, with the strongest level winning:

- `deadline_minutes <= 30` → `CRITICAL`;
- `deadline_minutes <= 120` → at least `HIGH`;
- `deadline_minutes <= 1440` → at least `MEDIUM`;
- `waiting_minutes >= 240` → at least `HIGH`;
- `waiting_minutes >= 60` → at least `MEDIUM`;
- `repeat_messages >= 4` → at least `HIGH`;
- `repeat_messages >= 2` → at least `MEDIUM`;
- otherwise → `LOW`.

Use reason codes such as:

- `DEADLINE_WITHIN_30_MIN`, `DEADLINE_WITHIN_2_HOURS`, `DEADLINE_WITHIN_24_HOURS`;
- `WAITING_OVER_4_HOURS`, `WAITING_OVER_1_HOUR`;
- `REPEATED_MESSAGE`, `REPEATED_MESSAGE_4_PLUS`.

The upstream layer must provide `deadline_minutes` if the demo needs a deadline;
do not read the wall clock inside this pure decision function. These thresholds are
prototype assumptions and must be documented as configurable later, not presented as
validated business metrics.

### 9.5 Action policy and precedence

The action policy is the final authority. Apply this order exactly, after input
validation and risk/urgency calculation:

```text
if contradiction == true:
    ESCALATE
else if risk == HIGH:
    ESCALATE
else if retrieval_status == "CONFLICTING":
    ESCALATE
else if retrieval_status == "EMPTY":
    ESCALATE
else if missing_information is not empty:
    ASK_CLARIFICATION
else if model_status == "FAILED":
    DRAFT_FOR_SELLER
else if grounded == false:
    if risk == MEDIUM:
        ESCALATE
    else:
        DRAFT_FOR_SELLER
else if confidence < 0.65:
    ESCALATE
else if risk == MEDIUM:
    DRAFT_FOR_SELLER
else if risk == LOW and grounded == true and confidence >= 0.90:
    AUTO_REPLY
else:
    DRAFT_FOR_SELLER
```

The following policy blockers must never allow `AUTO_REPLY`: contradiction, high
risk, missing/conflicting/unreliable evidence, failed grounding, low confidence,
model failure, unauthorized external side effect, or an unapproved commitment.
High risk takes precedence over missing information, so a refund request missing an
order ID still produces `ESCALATE`, not `ASK_CLARIFICATION`.

Required action reason-code examples:

- `EVIDENCE_CONTRADICTION`;
- `MISSING_INFORMATION`;
- `NOT_GROUNDED`;
- `LOW_CONFIDENCE`;
- `MODEL_FAILURE`;
- `NO_RETRIEVAL_EVIDENCE`;
- `CONFLICTING_RETRIEVAL_EVIDENCE`;
- `HIGH_RISK_REQUIRES_HUMAN`;
- `MEDIUM_RISK`;
- `HIGH_CONFIDENCE`.

The current fixture behavior is intentional: missing retrieval evidence escalates,
while model failure may produce a seller draft when no higher-priority risk blocker
exists. Do not collapse both states into one generic `grounded: false` branch.

Fuzzy similarity, sentiment, urgency, and model confidence can explain a decision,
but they must not independently grant permission to auto-send or execute an external
side effect.

### 9.6 Current fixture and integration boundary

The repository currently contains seven synthetic message scenarios in
`data/demo/messages.json`: safe FAQ, ambiguity, payment/refund risk, urgent deadline,
complaint/cancellation escalation, missing evidence, and model failure. Treat the
fixture's `expectedAction`, `expectedUrgency`, and `expectedEvidenceIds` as expected
behavior/test oracles. Do not pass the raw fixture directly to the engine because it
does not yet contain the structured extraction contract.

There is currently no implemented upstream component that produces the input above
and no implemented downstream component that consumes the result. The first
implementation must therefore:

1. expose a pure `determine(input)` interface;
2. keep adapter integration out of the engine;
3. document the expected upstream mapping from extraction/RAG/grounding output;
4. document that the future UI/audit layer will consume `risk`, `urgency`, `action`,
   and `reason_codes`;
5. avoid inventing live Shopee, RAG, LLM, persistence, or UI modules.

If a real shared interface is added later, adapt to it instead of creating a second
parallel request/response schema.

### 9.7 Tests and verification

The current repository has no test framework; `tests/README.md` is only a test
checklist and `package.json` currently exposes `validate:demo`. Use Node's built-in
`node:test` for the smallest dependency-free test suite, or use an already-present
framework if one is discovered. If adding the Node test suite, add an explicit
`npm test` script and do not claim that tests exist until they pass.

At minimum test these cases:

1. low-risk stock check → `LOW`, `AUTO_REPLY`;
2. refund request with money signal → `HIGH`, `ESCALATE`;
3. stock check missing `product_id` → `ASK_CLARIFICATION`;
4. delivery complaint → `MEDIUM`, `DRAFT_FOR_SELLER`;
5. legal signal on a normal intent → `HIGH`, `ESCALATE`;
6. safe stock check with a 15-minute deadline → `LOW`, `CRITICAL`, `AUTO_REPLY`;
7. ungrounded FAQ → never `AUTO_REPLY`;
8. contradictory evidence → `ESCALATE`;
9. unknown intent → never `LOW`;
10. high-risk refund with missing information → `ESCALATE`;
11. current safe FAQ fixture intent `product_and_shipping_faq` → `AUTO_REPLY`;
12. current missing-evidence fixture → `ESCALATE`;
13. current model-failure fixture → `DRAFT_FOR_SELLER`.

Also run the existing fixture validation:

```powershell
npm run validate:demo
npm test
```

Do not make network calls merely to test this layer.

## 10. Urgency model

Urgency must be explainable rather than an opaque number.

Useful signals:

- delivery or response deadline;
- payment or financial impact;
- order status risk;
- complaint/escalation language;
- customer sentiment;
- time waiting without response;
- likelihood of irreversible loss or reputational damage.

The UI should display both a priority level and the reasons, for example:

> High urgency — delivery deadline within 24 hours, customer requests cancellation, and payment status is unresolved.

Do not claim that the urgency score is a validated business metric. It is a transparent prototype ranking.

## 11. RAG knowledge base

The MVP knowledge base should contain small, realistic, versioned documents such as:

- store FAQ;
- product facts;
- shipping rules;
- return/exchange policy;
- approved response examples;
- seller-specific constraints.

Every generated answer should retain evidence references. If no reliable evidence is retrieved, Escala must not invent an answer.

For the hackathon, a small local JSON/Markdown knowledge base is preferable to building a production-grade ingestion platform.

## 12. Recommended technical direction

Prefer the fastest reliable stack the team already knows. A reasonable default is:

- a lightweight TypeScript/Node web app only after the policy slice is working;
- typed domain models when the selected stack supports them;
- seeded local data or a small local persistence layer;
- an OpenAI model adapter with a mock fallback in a later task;
- a small RAG adapter with evidence IDs in a later task;
- a deterministic policy module independent from UI and LLM calls.

The current `package.json` has no application framework or test dependency. Do not
add a framework, connector, database, or network dependency solely to implement the
Determination Engine. Prefer Node's built-in `node:test` for the initial tests and
add an explicit test script if needed.

Do not add authentication, multi-tenancy, live Shopee OAuth, mobile apps, background workers, billing, or complex infrastructure unless the core vertical slice is already working.

## 13. Minimum viable demo

The demo must handle at least these scenarios:

1. Routine product/FAQ question → grounded answer → AUTO_REPLY.
2. Ambiguous question → targeted clarification or seller draft.
3. Refund/payment/cancellation question → ESCALATE with visible risk explanation.
4. High urgency message → appears at the top of the seller queue with explainable factors.
5. Seller approves or edits a draft → status and audit timeline update.
6. Missing retrieval evidence or model failure → safe fallback instead of hallucinated reply.

The smallest acceptable vertical slice is:

```text
Seeded message
  → RAG evidence
  → risk/urgency classification
  → deterministic policy
  → one of four visible actions
  → audit timeline
```

## 14. Phase 0 — Setup deliverables

During setup, create or update these files:

```text
README.md
docs/PRODUCT.md
docs/ARCHITECTURE.md
docs/POLICY.md
docs/RAG-KNOWLEDGE-BASE.md
docs/DEMO-SCRIPT.md
docs/SETUP.md
docs/DECISIONS.md
docs/HACKATHON-COMPLIANCE.md
data/demo/messages.json
data/demo/knowledge-base.json
.env.example
```

The setup phase is complete when:

- README explains what Escala is and how to run the project;
- PRODUCT defines the user, problem, value proposition, and non-goals;
- ARCHITECTURE contains the system flow and module responsibilities;
- POLICY lists hard-risk categories and action rules;
- RAG-KNOWLEDGE-BASE documents the evidence model and fallback behavior;
- DEMO-SCRIPT describes a 3–5 minute judge-facing demo;
- SETUP lists prerequisites and commands;
- HACKATHON-COMPLIANCE records that Escala is a new build and does not reuse DOCRELAY artifacts;
- demo data covers safe, ambiguous, urgent, and high-risk messages;
- the team can explain what is real, mocked, synthetic, and not yet implemented.

Do not claim setup is complete until the files have been inspected and their links work.

## 15. Application draft

### Build direction

Select:

> Spans across several — primarily Direction 1: Autonomous & Adaptive AI and Direction 2: AI-Native Products & Operations.

### Problem

> Marketplace sellers receive a continuous stream of buyer messages, often across different channels and at all hours of the day. Many messages are repetitive and can be answered from existing store policies, product information, or delivery FAQs. However, messages involving refunds, cancellations, payment issues, complaints, delivery commitments, or policy exceptions require careful human judgment. Existing auto-reply systems either leave sellers with too much manual work or respond too confidently and create business and customer risk. Sellers also lack a clear way to understand which unanswered messages are truly urgent when they return after several hours.

### Target users

> The primary users are small and mid-sized marketplace sellers, store owners, and customer-support operators who manage a high volume of buyer messages with limited staff. Escala is especially useful for sellers who need to stay responsive outside business hours but cannot safely delegate every interaction to an AI system.

### Solution

> Escala is a web-based action recommender for marketplace sellers. It consolidates incoming messages into a normalized inbox, classifies intent and urgency, and retrieves relevant information from the seller’s product catalog, store policies, and FAQ knowledge base using RAG. For low-risk questions with strong supporting evidence, Escala can generate an answer automatically. For medium-confidence cases, it prepares a suggested response for seller approval. For high-risk or out-of-scope cases, a deterministic policy layer blocks automatic action and escalates the message with an explanation, evidence, and recommended next step. Escala also ranks unanswered messages by explainable urgency so sellers can focus on the issues that matter most.

### Codex plan

> We will use Codex to build Escala from scratch during the hackathon. Codex will help scaffold the web dashboard, define typed message and policy schemas, implement the inbox and triage workflow, build the RAG retrieval path, generate realistic synthetic messages, and create tests for different intent and risk levels. We will use Codex for fast iteration, debugging, refactoring, and demo preparation. The risk boundaries, auto-send conditions, escalation rules, and fallback behavior will remain explicit deterministic policies reviewed by the team rather than unrestricted model decisions.

## 16. Pre-build risk check

- Risk verdict: **Medium-high**. The engineering idea is feasible, but seller trust, live channel access, and the usefulness of urgency ranking are unvalidated.
- Main assumption: sellers will trust Escala enough to let it handle routine answers while relying on its ranking for high-risk messages.
- Smallest useful evidence: manually review 10–20 representative seller messages and compare Escala’s recommended action with a human decision.
- Do next: build one vertical slice with seeded messages, one small knowledge base, three action outcomes, and visible reasons.
- Delay: live multi-channel integrations, real message sending, authentication, multi-tenant architecture, mobile clients, analytics dashboards, and production reliability claims.

## 17. Operating rules for future agents

1. Read this file before making project decisions.
2. Preserve the distinction between facts, assumptions, and future plans.
3. Keep the policy engine deterministic and independently testable.
4. Never allow model output to bypass hard-risk rules.
5. Prefer mock/synthetic connectors for the hackathon demo.
6. Keep external side effects disabled by default.
7. Add an audit event for every recommendation and seller decision.
8. Keep README and demo claims honest about what is mocked or unvalidated.
9. Do not copy DOCRELAY or SAND code or artifacts.
10. Before expanding scope, verify that the minimum demo still works end to end.
11. Do not claim that an upstream or downstream module exists unless it is present in the workspace.
12. Treat `data/demo/messages.json` expected fields as test oracles, not as the Determination Engine input schema.
13. Keep risk, urgency, evidence/grounding, and action-policy blockers conceptually separate.

## 18. First response expected from an implementation agent

Before writing product code, respond with:

1. a concise repository inspection summary;
2. existing interfaces found, or an explicit statement that the repository is still Phase 0 and has none;
3. the proposed Determination Engine input/output contract and policy precedence;
4. the files to create or modify;
5. the test plan, including current fixture scenarios;
6. assumptions, especially intent mapping and urgency thresholds;
7. the exact next implementation action.

Then implement only the deterministic policy slice and its tests. Do not implement
the full product, live integrations, RAG, UI, seller messaging, or external side
effects until the engine contract is verified.

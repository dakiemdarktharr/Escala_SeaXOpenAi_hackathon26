# Escala judge-facing demo script

Target duration: 3–5 minutes. Use the local seeded inbox; do not depend on network access or live marketplace credentials.

## 1. Frame the problem — 30 seconds

“Marketplace sellers receive many repetitive questions, but the messages that matter most—payment, cancellation, delivery commitments, and complaints—need careful judgment. Escala recommends what should happen next, not just what an AI might say.”

Point out that the urgency rank is transparent prototype prioritization, not a validated business metric.

## 2. Safe FAQ — 40 seconds

Open `msg-safe-001`. Show the retrieved product and shipping evidence, the grounded answer, and `AUTO_REPLY`. Explain that the action is allowed only because this is a routine FAQ with reliable evidence and no hard-risk signal.

## 3. Ambiguity — 35 seconds

Open `msg-ambiguous-001`. Show that the buyer says an item does not fit but gives no order or product detail. Escala chooses `ASK_CLARIFICATION` and proposes one targeted question instead of guessing about eligibility.

## 4. High-risk and urgency — 60 seconds

Open `msg-highrisk-001` and then `msg-urgent-001`. Show payment/refund risk and delivery deadline factors. The queue puts the urgent item near the top and explains why. The policy still blocks automatic action and chooses `ESCALATE` when a financial dispute or unauthorized delivery guarantee is present.

## 5. Seller control and audit — 45 seconds

Open a seller-draft case, approve or edit the suggested text, and show the status change plus audit timeline event. Emphasize that seller decisions are recorded and the external-send toggle is disabled in the prototype.

## 6. Safe failure — 30 seconds

Open the missing-evidence or model-failure fixture. Show the limitation message, absent/failed evidence state, and non-automatic fallback. “No reliable evidence” must never become a confident invented answer.

## Close — 20 seconds

“The core vertical slice is message → evidence → risk and urgency → deterministic policy → visible action → audit. The next validation step is to compare recommendations with human decisions on 10–20 real representative messages before adding live integrations.”

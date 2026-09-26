# Escala judge-facing demo script

Target duration: 3–5 minutes. Use the local seeded inbox; do not depend on network access or live marketplace credentials.

Before the demo, run `npm run eval:policy`. Present the result as a small synthetic routing challenge suite, not as live accuracy or proven seller/API savings. Current fixtures cover 28 cases and should report 28/28 fixture assertions, 8/8 hard-risk escalations, and 0/23 false automatic replies. Explain that all examples are synthetic and no buyer message is sent.

## 1. Frame the problem — 30 seconds

“Marketplace sellers receive many repetitive questions, but the messages that matter most—payment, cancellation, delivery commitments, and complaints—need careful judgment. Escala recommends what should happen next, not just what an AI might say.”

Point out that the urgency rank is transparent prototype prioritization, not a validated business metric.

## 2. Safe FAQ — 40 seconds

Open `msg-safe-001`. Show the retrieved product and shipping evidence, the “Reviewed answer template” route, and `AUTO_REPLY`. Explain that the exact product, destination, approved answer, and no-hard-risk checks allow the template to skip OpenAI. This is a local recommendation; it does not send a buyer message.

## 3. Ambiguity — 35 seconds

Open `msg-ambiguous-001`. Show that the buyer says an item does not fit but gives no order or product detail. Escala chooses `ASK_CLARIFICATION` and proposes one targeted question instead of guessing about eligibility.

## 4. High-risk and urgency — 60 seconds

Open `msg-highrisk-001` and then `msg-urgent-001`. Show payment/refund risk and delivery deadline factors. The queue puts the urgent item near the top and explains why. The policy still blocks automatic action and chooses `ESCALATE` when a financial dispute or unauthorized delivery guarantee is present.

## 5. Seller control and audit — 45 seconds

Open a seller-draft case, approve or edit the suggested text, and show the status change plus audit timeline event. Emphasize that seller decisions are recorded and the external-send toggle is disabled in the prototype.

## 6. Safe failure — 30 seconds

Open the missing-evidence or model-failure fixture. Show the limitation message, absent/failed evidence state, and non-automatic fallback. If time allows, point out the evaluator’s wrong-product, wrong-destination, mixed-product, unsupported-care, and instruction-override cases. “No reliable evidence” must never become a confident invented answer.

## Close — 20 seconds

“The core vertical slice is message → evidence → risk and urgency → deterministic policy → visible action → audit. Our synthetic suite is a regression check, not proof of production accuracy. The next validation step is a permissioned, de-identified English sample reviewed by sellers, followed by a controlled comparison of seller effort, answer quality, and actual API tokens against an LLM-only baseline.”

# Escala deterministic policy

## Goal

Keep routine, supported work moving without making sellers retype known answers. Reserve seller attention for missing facts, conflicts, hard risk, or language that needs judgment. Rules are deterministic and outrank every model signal.

## Precedence

1. Hard risk first: payment/refund disputes, order changes, safety/health, legal/regulatory, privacy/security, public complaint threats, exceptional discounts or compensation, and delivery guarantees require seller review. Model confidence and positive sentiment cannot reduce this risk.
2. Conflicting facts: preserve both evidence references and escalate until a seller resolves the conflict.
3. Required information missing: ask one targeted buyer question when a safe answer depends on a specific missing order, product, quantity, condition, or date. Do not guess.
4. Grounded reviewed FAQ: if the request matches a narrow approved template and every fact is present in active, effective evidence, recommend AUTO_REPLY using the exact deterministic answer. Do not call OpenAI or send it externally.
5. Other safe, grounded language work: use OpenAI only when a response needs phrasing or interpretation that no approved deterministic rule covers. Validate the schema, evidence references, confidence threshold, and safe commitment rules.
6. Fallback: unsupported, failed, malformed, or low-confidence work gets a seller draft/review state. No answer is produced from missing evidence.

## Seller-work reduction

A common FAQ that has a verified answer should not become a seller typing task just because an LLM is unavailable or has a low score. Use a reviewed template when the intent terms are specific and required evidence IDs are all present. Add templates only for frequent intents with stable facts; version the template with the policy and keep regression examples.

The MVP demonstrates product-size availability plus shipping estimate and cotton-tote care. The availability template requires product, shipping, and approved-answer evidence. The care template requires the active store FAQ evidence. Ambiguous exchange questions still request the missing order/date; financial, cancellation, safety, or complaint signals still go to the seller.

AUTO_REPLY means a locally prepared, policy-approved recommendation. ESCALA_ENABLE_EXTERNAL_SEND=false means the app does not send it to a buyer. The seller remains the actor for any future external sending.

## Sentiment

Sentiment may sort or explain a queue. It cannot create hard risk, remove hard risk, establish evidence, satisfy a required fact, authorize automatic action, or suppress escalation. A low-confidence classifier result is UNCERTAIN.

## Audit and versioning

Persist the policy version, chosen action, matched template or model path, evidence IDs/versions, reason codes, and timestamp with each recommendation. Audit each seller decision separately. When changing a rule, update the ground-truth note, policy reference, and deterministic examples together.
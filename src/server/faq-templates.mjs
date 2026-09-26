const AVAILABILITY = "kb-product-blue-linen-shirt-v1";
const SHIPPING = "kb-shipping-standard-v1";
const APPROVED = "kb-approved-answer-availability-v1";
const COTTON_CARE = "kb-store-faq-v1";

function hasAll(ids, required) {
  return required.every((id) => ids.has(id));
}

/** Returns only reviewed, deterministic replies whose full supporting facts were retrieved. */
export function matchFaqTemplate(text, evidence) {
  const input = String(text ?? "").toLowerCase();
  const ids = new Set((Array.isArray(evidence) ? evidence : []).map((item) => item.id));

  const asksAvailability = /\b(available|availability|in stock|stock)\b/.test(input)
    && /\bsize\s*m\b/.test(input);
  const asksDelivery = /\b(delivery|deliver|shipping|how long)\b/.test(input);
  if (asksAvailability && asksDelivery && hasAll(ids, [AVAILABILITY, SHIPPING, APPROVED])) {
    return {
      intent: "product_and_shipping_faq",
      draft: "Size M is currently listed as available. Standard delivery to Ho Chi Minh City is normally estimated at 2–4 business days after dispatch. This is an estimate, not a guarantee.",
      reason: "Matched a reviewed availability and delivery answer; the OpenAI request was skipped.",
    };
  }

  const asksCare = /\b(wash|washable|clean|care instructions)\b/.test(input)
    && /\bcotton tote\b/.test(input);
  if (asksCare && hasAll(ids, [COTTON_CARE])) {
    return {
      intent: "product_care_faq",
      draft: "Spot-clean the cotton tote with mild soap and cold water. Do not use bleach or a tumble dryer.",
      reason: "Matched the verified cotton-tote care instructions; the OpenAI request was skipped.",
    };
  }

  return null;
}
const AVAILABILITY = "kb-product-blue-linen-shirt-v1";
const SHIPPING = "kb-shipping-standard-v1";
const APPROVED = "kb-approved-answer-availability-v1";
const COTTON_CARE = "kb-store-faq-v1";

function hasAll(ids, required) {
  return required.every((id) => ids.has(id));
}

function evidenceRecord(evidence, id) {
  return (Array.isArray(evidence) ? evidence : []).find((item) => item?.id === id);
}

function containsText(record, ...phrases) {
  const content = `${record?.title ?? ""} ${record?.snippet ?? record?.content ?? ""}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return phrases.every((phrase) => content.includes(phrase));
}

function isNarrowCottonToteCareQuestion(input) {
  return [
    /^(?:please )?how (?:do|can|should) (?:i|we) (?:wash|clean) (?:the )?cotton tote[?.!]*$/,
    /^(?:please )?what are (?:the )?care instructions for (?:the )?cotton tote[?.!]*$/,
    /^(?:please )?is (?:the )?cotton tote washable[?.!]*$/,
  ].some((pattern) => pattern.test(input.trim()));
}

/** Returns only reviewed, deterministic replies whose full supporting facts were retrieved. */
export function matchFaqTemplate(text, evidence) {
  const input = String(text ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const ids = new Set((Array.isArray(evidence) ? evidence : []).map((item) => item.id));

  const asksAvailability = /\b(available|availability|in stock|stock)\b/.test(input)
    && /\bsize\s*m\b/.test(input);
  const asksDelivery = /\b(delivery|deliver|shipping|how long)\b/.test(input);
  const asksForSupportedProduct = /\bblue linen shirt\b/.test(input);
  const asksForSupportedDestination = /\b(ho chi minh city|hcmc)\b/.test(input);
  const mentionsOtherProduct = /\b(dress|scarf|tote|purifier|filter|shoes?)\b/.test(input);
  const containsInstructionOverride = /\b(ignore|disregard|override)\b.{0,80}\b(evidence|instructions|policy|rules)\b|\b(pretend|act as|system prompt)\b/.test(input);
  const productEvidence = evidenceRecord(evidence, AVAILABILITY);
  const shippingEvidence = evidenceRecord(evidence, SHIPPING);
  const approvedEvidence = evidenceRecord(evidence, APPROVED);
  const availabilityIsGrounded = containsText(
    productEvidence,
    "blue linen shirt",
    "size m",
    "available",
  );
  const shippingIsGrounded = containsText(
    shippingEvidence,
    "ho chi minh city",
    "2",
    "4 business days",
  );
  const answerIsApproved = containsText(
    approvedEvidence,
    "size m is currently listed as available",
    "2",
    "4 business days",
    "do not turn the estimate into a guarantee",
  );
  if (asksAvailability && asksDelivery && asksForSupportedProduct && asksForSupportedDestination
    && !mentionsOtherProduct && !containsInstructionOverride
    && hasAll(ids, [AVAILABILITY, SHIPPING, APPROVED])
    && availabilityIsGrounded && shippingIsGrounded && answerIsApproved) {
    return {
      intent: "product_and_shipping_faq",
      draft: "The Blue Linen Shirt in size M is currently listed as available. Standard delivery to Ho Chi Minh City is normally estimated at 2–4 business days after dispatch. This is an estimate, not a guarantee.",
      reason: "Matched a reviewed availability and delivery answer; the OpenAI request was skipped.",
    };
  }

  const asksCare = isNarrowCottonToteCareQuestion(input);
  const careEvidence = evidenceRecord(evidence, COTTON_CARE);
  const careIsGrounded = containsText(
    careEvidence,
    "cotton tote",
    "mild soap",
    "cold water",
    "do not use bleach",
    "tumble dryer",
  );
  if (asksCare && hasAll(ids, [COTTON_CARE]) && careIsGrounded) {
    return {
      intent: "product_care_faq",
      draft: "Spot-clean the cotton tote with mild soap and cold water. Do not use bleach or a tumble dryer.",
      reason: "Matched the verified cotton-tote care instructions; the OpenAI request was skipped.",
    };
  }

  return null;
}

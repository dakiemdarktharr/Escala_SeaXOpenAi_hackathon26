const HARD_RISK_PATTERNS = [
  ["financial impact requires seller review", /\b(refund|refunds|refunded|charged|charge|payment|money|duplicate charge|double charged|reimburse|billing|paid twice)\b|hoàn tiền|bị trừ tiền|thanh toán|tính tiền|thu tiền/i],
  ["order changes are not performed by Escala", /\b(cancel|cancellation|change my order|modify my order|order status|change address|change quantity)\b|hủy đơn|huỷ đơn|đổi đơn|đổi địa chỉ/i],
  ["delivery commitments need verified carrier information", /\b(guarantee|must arrive|deadline|before \d|by today|by tomorrow|promise delivery|arrive by)\b|cam kết giao|phải giao trước|giao đúng ngày/i],
  ["complaint or reputation risk requires seller review", /\b(post .*public|publicly|social media|complaint|report you|lawsuit|legal action|regulator|regulatory)\b|đăng công khai|bóc phốt|khiếu nại|kiện|cơ quan chức năng/i],
  ["safety or health concerns require seller review", /\b(injur|injured|injury|unsafe|safety|allergy|allergic|poison|hazard|medical|health issue)\b|dị ứng|chấn thương|bị thương|không an toàn|sức khỏe|ngộ độc/i],
  ["account, identity, or security issues require seller review", /\b(account hacked|password|credential|identity|stolen account|unauthorized access|security breach|personal data)\b|mật khẩu|tài khoản bị hack|đánh cắp tài khoản|dữ liệu cá nhân/i],
  ["exceptional discounts or compensation require seller review", /\b(discount|coupon|compensation|compensate|free replacement|store credit|waive the fee)\b|giảm giá|mã giảm|bồi thường|đền bù/i],
  ["requested external actions need seller approval", /\b(send|issue|apply|dispatch|ship it|change|delete|publish)\b.{0,35}\b(now|immediately|for me|my order|the refund|a discount|a replacement)\b|gửi ngay|thực hiện giúp|xóa đơn/i],
];

const REQUIRED_SAFE_EVIDENCE = [
  "kb-product-blue-linen-shirt-v1",
  "kb-shipping-standard-v1",
  "kb-approved-answer-availability-v1",
];

export function detectHardRisk(text, scenario = "") {
  const reasons = HARD_RISK_PATTERNS
    .filter(([, pattern]) => pattern.test(text))
    .map(([reason]) => reason);
  if (["high_risk_payment", "urgent_deadline", "complaint_escalation"].includes(scenario) && reasons.length === 0) {
    reasons.push("fixture is classified for human review");
  }
  return { hard: reasons.length > 0, reasons };
}

export function evaluateRecommendation({
  text,
  scenario,
  confidence,
  missingInformation = [],
  evidenceIds = [],
  threshold = 0.9,
  hasApprovedAnswer = false,
}) {
  const risk = detectHardRisk(text, scenario);
  if (risk.hard) return { action: "ESCALATE", reasons: risk.reasons };
  if (scenario === "missing_evidence" || evidenceIds.length === 0) {
    return { action: "ESCALATE", reasons: ["no verified evidence was retrieved"] };
  }
  if (missingInformation.length > 0) {
    return { action: "ASK_CLARIFICATION", reasons: ["model identified missing information"] };
  }
  const cited = new Set(evidenceIds);
  const fullyGrounded = REQUIRED_SAFE_EVIDENCE.every((id) => cited.has(id)) && hasApprovedAnswer;
  const routineQuestion = scenario === "safe_faq" && /\b(available|availability|size|standard delivery|how long)\b/i.test(text);
  if (!fullyGrounded) {
    return { action: "DRAFT_FOR_SELLER", reasons: ["evidence did not pass the approved-answer grounding check"] };
  }
  if (!routineQuestion) {
    return { action: "DRAFT_FOR_SELLER", reasons: ["only the reviewed routine FAQ is eligible for automatic reply"] };
  }
  if (!Number.isFinite(confidence) || confidence < threshold) {
    return { action: "DRAFT_FOR_SELLER", reasons: ["seller confirmation required because confidence is below threshold"] };
  }
  return { action: "AUTO_REPLY", reasons: ["reviewed routine FAQ, approved answer, complete evidence, and confidence threshold passed"] };
}

export const APPROVED_AVAILABILITY_ANSWER =
  "Size M is currently listed as available. Standard delivery to Ho Chi Minh City is normally estimated at 2–4 business days after dispatch. This is an estimate, not a guarantee.";

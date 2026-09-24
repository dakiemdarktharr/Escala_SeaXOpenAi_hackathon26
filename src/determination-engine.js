export const POLICY = Object.freeze({
  version: 'determination-v1',
  minimumModelConfidence: 0.9,
  minimumEvidenceConfidence: 0.9,
  highUrgencyHours: 24,
  hardRiskFlags: Object.freeze(['PAYMENT', 'REFUND', 'COMPLAINT', 'CANCELLATION']),
  intents: Object.freeze([
    'faq', 'ambiguous', 'payment', 'refund', 'delivery_deadline',
    'complaint', 'cancellation', 'unknown',
  ]),
});

const RISKY_INTENTS = new Set(['payment', 'refund', 'complaint', 'cancellation']);
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'];
const EVIDENCE_STATUSES = ['GROUNDED', 'MISSING', 'CONFLICTING'];
const MODEL_STATUSES = ['OK', 'FAILED', 'UNAVAILABLE'];
const INPUT_KEYS = [
  'messageId', 'evaluationId', 'evaluatedAt', 'hardRiskFlags',
  'hoursUntilDeadline', 'evidence', 'model', 'automationAllowed',
];

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isNonblank = (value) => typeof value === 'string' && value.trim().length > 0;
const isConfidence = (value) => Number.isFinite(value) && value >= 0 && value <= 1;

function checkKeys(record, allowed, path, issues) {
  for (const key of Object.keys(record).sort()) {
    if (!allowed.includes(key)) issues.push(`${path}.${key} is not a supported field`);
  }
}

function requireAuditIdentity(input) {
  if (!isRecord(input) || !isNonblank(input.messageId) || !isNonblank(input.evaluationId)) {
    throw new TypeError('messageId and evaluationId must be nonblank strings');
  }
  const timestamp = typeof input.evaluatedAt === 'string' ? Date.parse(input.evaluatedAt) : NaN;
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== input.evaluatedAt) {
    throw new TypeError('evaluatedAt must be a canonical ISO UTC timestamp, including milliseconds');
  }
}

/**
 * Evaluate manually supplied, normalized signals. This function neither detects
 * risk from raw text nor retrieves evidence, drafts replies, persists, or sends.
 * See docs/DETERMINATION-ENGINE.md for the versioned contract and assumptions.
 */
export function determineAction(input) {
  requireAuditIdentity(input);
  const validationIssues = [];
  checkKeys(input, INPUT_KEYS, 'input', validationIssues);

  const suppliedFlags = Array.isArray(input.hardRiskFlags) ? Array.from(input.hardRiskFlags) : [];
  if (!Array.isArray(input.hardRiskFlags) || suppliedFlags.some((flag) => !POLICY.hardRiskFlags.includes(flag))) {
    validationIssues.push('hardRiskFlags must be an array of supported hard-risk flags');
  }
  // Preserve every recognized flag even when other decision fields are invalid.
  const hardRiskFlags = POLICY.hardRiskFlags.filter((flag) => suppliedFlags.includes(flag));

  const validDeadline = input.hoursUntilDeadline === null || Number.isFinite(input.hoursUntilDeadline);
  if (!validDeadline) validationIssues.push('hoursUntilDeadline must be a finite number or null');
  const hoursUntilDeadline = validDeadline ? input.hoursUntilDeadline : null;
  const urgency = {
    level: hoursUntilDeadline === null ? 'UNKNOWN'
      : hoursUntilDeadline <= 0 ? 'CRITICAL'
        : hoursUntilDeadline <= POLICY.highUrgencyHours ? 'HIGH' : 'NORMAL',
    hoursUntilDeadline,
  };

  const evidence = isRecord(input.evidence) ? input.evidence : {};
  const evidenceIssues = [];
  if (!isRecord(input.evidence)) evidenceIssues.push('evidence must be an object');
  checkKeys(evidence, ['status', 'confidence', 'sourceIds'], 'evidence', evidenceIssues);
  if (!EVIDENCE_STATUSES.includes(evidence.status)) evidenceIssues.push('evidence.status is unsupported');
  if (!isConfidence(evidence.confidence)) evidenceIssues.push('evidence.confidence must be a number from 0 to 1');
  if (!Array.isArray(evidence.sourceIds) || Array.from(evidence.sourceIds).some((source) => !isNonblank(source))) {
    evidenceIssues.push('evidence.sourceIds must be an array of nonblank strings');
  }
  validationIssues.push(...evidenceIssues);
  const grounding = {
    status: evidenceIssues.length ? 'INVALID' : evidence.status,
    confidence: isConfidence(evidence.confidence) ? evidence.confidence : null,
    sourceIds: Array.isArray(evidence.sourceIds)
      ? [...new Set(evidence.sourceIds.filter(isNonblank))].sort() : [],
  };

  const model = isRecord(input.model) ? input.model : {};
  const modelIssues = [];
  if (!isRecord(input.model)) modelIssues.push('model must be an object');
  checkKeys(model, ['status', 'intent', 'risk', 'confidence'], 'model', modelIssues);
  if (!MODEL_STATUSES.includes(model.status)) modelIssues.push('model.status is unsupported');
  // Failed or unavailable model payloads are never used as classifications.
  if (model.status === 'OK') {
    if (!POLICY.intents.includes(model.intent)) modelIssues.push('model.intent is unsupported');
    if (!RISK_LEVELS.includes(model.risk)) modelIssues.push('model.risk is unsupported');
    if (!isConfidence(model.confidence)) modelIssues.push('model.confidence must be a number from 0 to 1');
  }
  validationIssues.push(...modelIssues);
  if (typeof input.automationAllowed !== 'boolean') {
    validationIssues.push('automationAllowed must be a boolean');
  }

  // Recognizable risk-raising model signals survive unrelated malformed fields.
  const modelRisk = model.status === 'OK' && RISK_LEVELS.includes(model.risk) ? model.risk : null;
  const riskyIntent = model.status === 'OK' && RISKY_INTENTS.has(model.intent);
  const risk = {
    level: hardRiskFlags.length || riskyIntent || modelRisk === 'HIGH' ? 'HIGH'
      : modelRisk === 'MEDIUM' ? 'MEDIUM'
        : modelRisk === 'LOW' && !modelIssues.length ? 'LOW' : 'UNKNOWN',
    hardRiskFlags,
    modelRisk,
  };

  const reasons = [];
  const blockers = [];
  const addReason = (code, message) => reasons.push({ code, message });
  const block = (code, message) => {
    blockers.push(code);
    addReason(code, message);
  };

  for (const flag of hardRiskFlags) {
    addReason(`HARD_RISK_${flag}`, `${flag.toLowerCase()} is a hard-risk signal requiring seller escalation.`);
  }
  if (modelRisk === 'HIGH') addReason('MODEL_HIGH_RISK', 'The model reports high risk; escalate to the seller.');
  if (riskyIntent) addReason('RISKY_INTENT', `The ${model.intent} intent requires seller escalation.`);
  if (validationIssues.length) block('INVALID_INPUT', 'Decision fields failed validation; automatic replies are blocked.');
  if (modelIssues.length) {
    block('MODEL_INVALID', 'Model classification is malformed or unsupported.');
  } else if (model.status === 'FAILED') {
    block('MODEL_FAILED', 'Model classification failed; seller review is required.');
  } else if (model.status === 'UNAVAILABLE') {
    block('MODEL_UNAVAILABLE', 'Model classification is unavailable; seller review is required.');
  } else {
    if (model.confidence < POLICY.minimumModelConfidence) {
      block('LOW_MODEL_CONFIDENCE', 'Model confidence is below 0.90.');
    }
    if (model.intent === 'ambiguous' || model.intent === 'unknown') {
      block('UNCLEAR_INTENT', 'The request needs seller review or clarification.');
    } else if (model.intent !== 'faq' && !riskyIntent) {
      block('NON_ROUTINE_INTENT', 'This intent is outside the routine FAQ automation allowlist.');
    }
  }
  if (risk.level === 'MEDIUM') block('MEDIUM_RISK', 'Medium-risk classifications require seller review.');

  if (grounding.status === 'INVALID') {
    block('INVALID_EVIDENCE', 'Evidence fields are malformed; seller review is required.');
  } else if (grounding.status === 'MISSING') {
    block('MISSING_EVIDENCE', 'No grounding evidence is available.');
  } else if (grounding.status === 'CONFLICTING') {
    block('CONFLICTING_EVIDENCE', 'Grounding evidence conflicts and requires seller review.');
  } else {
    if (!grounding.sourceIds.length) block('NO_EVIDENCE_SOURCES', 'Grounded evidence must identify at least one source.');
    if (grounding.confidence < POLICY.minimumEvidenceConfidence) {
      block('LOW_EVIDENCE_CONFIDENCE', 'Evidence confidence is below 0.90.');
    }
  }
  if (input.automationAllowed !== true) {
    block('AUTOMATION_NOT_ALLOWED', 'Automatic replies have not been explicitly allowed.');
  }

  const action = risk.level === 'HIGH' ? 'ESCALATE'
    : blockers.length ? 'DRAFT_FOR_REVIEW' : 'AUTO_REPLY';
  if (action === 'AUTO_REPLY') {
    addReason('AUTO_REPLY_ELIGIBLE', 'Routine FAQ with sufficient grounding, confidence, low risk, and automation permission.');
  }

  const decision = { action, risk, urgency, grounding, blockers, reasons, validationIssues };
  const auditEvent = {
    type: 'recommendation.created',
    eventId: input.evaluationId,
    messageId: input.messageId,
    evaluationId: input.evaluationId,
    evaluatedAt: input.evaluatedAt,
    policyVersion: POLICY.version,
    recommendation: structuredClone(decision),
    signals: {
      automationAllowed: input.automationAllowed === true,
      model: {
        status: modelIssues.length ? 'INVALID' : model.status,
        intent: model.status === 'OK' && POLICY.intents.includes(model.intent) ? model.intent : null,
        confidence: model.status === 'OK' && isConfidence(model.confidence) ? model.confidence : null,
        risk: modelRisk,
      },
    },
  };
  return { ...decision, auditEvent };
}

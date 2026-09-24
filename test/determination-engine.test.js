import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { determineAction } from '../src/determination-engine.js';

const fixtures = JSON.parse(readFileSync(new URL('./fixtures/determination-cases.json', import.meta.url), 'utf8'));
const safeInput = (overrides = {}) => ({
  messageId: 'message-test', evaluationId: 'evaluation-test', evaluatedAt: '2026-09-24T00:00:00.000Z',
  hardRiskFlags: [], hoursUntilDeadline: null,
  evidence: { status: 'GROUNDED', confidence: 0.95, sourceIds: ['kb-shipping'] },
  model: { status: 'OK', intent: 'faq', risk: 'LOW', confidence: 0.95 },
  automationAllowed: true, ...overrides,
});
const reasonCodes = (result) => result.reasons.map(({ code }) => code);
function assertReview(input, reason) {
  const result = determineAction(input);
  assert.equal(result.action, 'DRAFT_FOR_REVIEW');
  assert.ok(result.blockers.includes(reason), `Missing blocker ${reason}`);
  assert.ok(reasonCodes(result).includes(reason), `Missing reason ${reason}`);
  return result;
}
function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

test('all 16 synthetic scenarios match independently stored expectations', async (t) => {
  assert.equal(fixtures.length, 16);
  assert.equal(new Set(fixtures.map(({ id }) => id)).size, fixtures.length);
  for (const fixture of fixtures) await t.test(fixture.id, () => {
    const result = determineAction(fixture.input);
    assert.equal(result.action, fixture.expected.action);
    assert.equal(result.risk.level, fixture.expected.risk);
    assert.equal(result.urgency.level, fixture.expected.urgency);
    assert.ok(reasonCodes(result).includes(fixture.expected.reasonCode));
    assert.equal(result.auditEvent.type, 'recommendation.created');
  });
});

for (const flag of ['PAYMENT', 'REFUND', 'COMPLAINT', 'CANCELLATION']) {
  test(`${flag} beats reassuring model output and unrelated invalid or missing signals`, () => {
    for (const changes of [{}, { evidence: null }, { model: undefined },
      { model: { status: 'OK', intent: 'faq', risk: 'LOW', confidence: 'certain' } },
      { hoursUntilDeadline: NaN, automationAllowed: undefined }, { expected: { action: 'AUTO_REPLY' } }]) {
      const result = determineAction(safeInput({ ...changes, hardRiskFlags: [flag, 'UNRECOGNIZED'] }));
      assert.equal(result.action, 'ESCALATE');
      assert.equal(result.risk.level, 'HIGH');
      assert.deepEqual(result.risk.hardRiskFlags, [flag]);
      assert.ok(reasonCodes(result).includes(`HARD_RISK_${flag}`));
      assert.ok(result.validationIssues.length > 0);
    }
  });
}

test('recognized model signals raise risk despite malformed sibling fields', () => {
  for (const model of [{ status: 'OK', risk: 'HIGH' },
    ...['payment', 'refund', 'complaint', 'cancellation'].map((intent) => ({ status: 'OK', intent }))]) {
    const result = determineAction(safeInput({ model }));
    assert.equal(result.action, 'ESCALATE');
    assert.equal(result.risk.level, 'HIGH');
    assert.ok(result.validationIssues.length > 0);
  }
  const medium = assertReview(safeInput({ model: { ...safeInput().model, risk: 'MEDIUM' } }), 'MEDIUM_RISK');
  assert.equal(medium.risk.level, 'MEDIUM');
});

test('failed and unavailable models cannot contribute stale high-risk classifications', () => {
  for (const status of ['FAILED', 'UNAVAILABLE']) {
    const result = assertReview(safeInput({ model: { status, intent: 'refund', risk: 'HIGH', confidence: 1 } }), `MODEL_${status}`);
    assert.equal(result.risk.level, 'UNKNOWN');
    assert.equal(result.risk.modelRisk, null);
  }
});

for (const [field, blocker] of [['model', 'LOW_MODEL_CONFIDENCE'], ['evidence', 'LOW_EVIDENCE_CONFIDENCE']]) {
  test(`${field} confidence threshold is inclusive and never coerced`, () => {
    for (const confidence of [0.9, 1]) {
      const input = safeInput(); input[field].confidence = confidence;
      assert.equal(determineAction(input).action, 'AUTO_REPLY');
    }
    for (const confidence of [0, 0.899999]) {
      const input = safeInput(); input[field].confidence = confidence;
      assertReview(input, blocker);
    }
    for (const confidence of [-0.01, 1.01, NaN, Infinity, '0.95', null, undefined]) {
      const input = safeInput(); input[field].confidence = confidence;
      assertReview(input, 'INVALID_INPUT');
    }
  });
}

test('urgency boundaries remain independent from action and risk', () => {
  for (const [hoursUntilDeadline, level] of [[-1, 'CRITICAL'], [0, 'CRITICAL'], [0.01, 'HIGH'],
    [24, 'HIGH'], [24.01, 'NORMAL'], [null, 'UNKNOWN']]) {
    for (const [overrides, action] of [[{}, 'AUTO_REPLY'], [{ automationAllowed: false }, 'DRAFT_FOR_REVIEW'],
      [{ hardRiskFlags: ['REFUND'] }, 'ESCALATE']]) {
      const result = determineAction(safeInput({ ...overrides, hoursUntilDeadline }));
      assert.equal(result.action, action);
      assert.deepEqual(result.urgency, { level, hoursUntilDeadline });
    }
  }
  const input = safeInput(); input.model.intent = 'delivery_deadline';
  assert.equal(assertReview(input, 'NON_ROUTINE_INTENT').urgency.level, 'UNKNOWN');
});

test('absent, failed, unsupported, and malformed classifications require review', () => {
  for (const model of [undefined, null, [], {}, { status: 'OK' }, { status: 'SURPRISE' },
    { ...safeInput().model, intent: 'new_intent' }, { ...safeInput().model, risk: 'NONE' },
    { ...safeInput().model, expected: 'AUTO_REPLY' }]) assertReview(safeInput({ model }), 'MODEL_INVALID');
  for (const status of ['FAILED', 'UNAVAILABLE']) assertReview(safeInput({ model: { status } }), `MODEL_${status}`);
  for (const intent of ['ambiguous', 'unknown']) {
    assertReview(safeInput({ model: { ...safeInput().model, intent } }), 'UNCLEAR_INTENT');
  }
});

test('missing, conflicting, invalid, and unsupported grounding cannot authorize automation', () => {
  for (const status of ['MISSING', 'CONFLICTING']) {
    const result = assertReview(safeInput({ evidence: { ...safeInput().evidence, status } }), `${status}_EVIDENCE`);
    assert.equal(result.risk.level, 'LOW');
    assert.equal(result.grounding.status, status);
  }
  for (const evidence of [undefined, null, [], {}, { ...safeInput().evidence, status: 'VERIFIED' },
    { ...safeInput().evidence, sourceIds: null }, { ...safeInput().evidence, sourceIds: [''] },
    { ...safeInput().evidence, sourceIds: ['  '] }, { ...safeInput().evidence, sourceIds: [42] },
    { ...safeInput().evidence, expected: 'AUTO_REPLY' }]) {
    assert.equal(assertReview(safeInput({ evidence }), 'INVALID_EVIDENCE').grounding.status, 'INVALID');
  }
  assertReview(safeInput({ evidence: { ...safeInput().evidence, sourceIds: [] } }), 'NO_EVIDENCE_SOURCES');
});

test('malformed permissions, deadlines, flags, and extra fixture fields fail closed', () => {
  for (const automationAllowed of [undefined, null, 'true', 1]) {
    assertReview(safeInput({ automationAllowed }), 'INVALID_INPUT');
  }
  const denied = assertReview(safeInput({ automationAllowed: false }), 'AUTOMATION_NOT_ALLOWED');
  assert.equal(denied.risk.level, 'LOW');
  for (const hoursUntilDeadline of [undefined, '12', NaN, Infinity, -Infinity, {}]) {
    const result = assertReview(safeInput({ hoursUntilDeadline }), 'INVALID_INPUT');
    assert.deepEqual(result.urgency, { level: 'UNKNOWN', hoursUntilDeadline: null });
  }
  for (const hardRiskFlags of [undefined, null, 'PAYMENT', [null], ['UNKNOWN'], ['payment']]) {
    assertReview(safeInput({ hardRiskFlags }), 'INVALID_INPUT');
  }
  assertReview(safeInput({ expected: { action: 'AUTO_REPLY' } }), 'INVALID_INPUT');
  assertReview(safeInput({ message: 'A raw message is not a normalized engine input.' }), 'INVALID_INPUT');
});

test('audit identity must be valid even when risk would otherwise escalate', () => {
  for (const input of [null, undefined, [], {},
    ...['messageId', 'evaluationId'].flatMap((key) => [undefined, '', '  ', 42].map((value) => safeInput({ [key]: value }))),
    ...[undefined, '', 'not-a-date', '2026-09-24T00:00:00Z', '2026-09-24T07:00:00.000+07:00',
      '2026-02-30T00:00:00.000Z', 0].map((evaluatedAt) => safeInput({ evaluatedAt, hardRiskFlags: ['REFUND'] }))]) {
    assert.throws(() => determineAction(input), TypeError);
  }
});

test('sparse arrays are malformed observations rather than absent risk or valid evidence', () => {
  assertReview(safeInput({ hardRiskFlags: Array(1) }), 'INVALID_INPUT');
  const sourceIds = ['kb-shipping']; sourceIds.length = 2;
  assertReview(safeInput({ evidence: { ...safeInput().evidence, sourceIds } }), 'INVALID_EVIDENCE');
});

test('every returned action has an attributable, versioned audit snapshot', () => {
  for (const overrides of [{}, { automationAllowed: false }, { hardRiskFlags: ['PAYMENT'] }, { evidence: null }]) {
    const input = safeInput(overrides);
    const { auditEvent, ...decision } = determineAction(input);
    assert.equal(auditEvent.type, 'recommendation.created');
    assert.equal(auditEvent.eventId, input.evaluationId);
    assert.equal(auditEvent.messageId, input.messageId);
    assert.equal(auditEvent.evaluationId, input.evaluationId);
    assert.equal(auditEvent.evaluatedAt, input.evaluatedAt);
    assert.equal(auditEvent.policyVersion, 'determination-v1');
    assert.deepEqual(auditEvent.recommendation, decision);
    assert.deepEqual(auditEvent.signals, { automationAllowed: input.automationAllowed,
      model: { status: 'OK', intent: 'faq', confidence: 0.95, risk: 'LOW' } });
    assert.notEqual(auditEvent.recommendation.reasons, decision.reasons);
    assert.ok(decision.reasons.every(({ code, message }) => code.length > 0 && message.length > 0));
  }
});

test('evaluation is deterministic, leaves frozen inputs intact, and returns independent data', (t) => {
  const input = deepFreeze(safeInput({ hardRiskFlags: ['REFUND'],
    evidence: { status: 'GROUNDED', confidence: 1, sourceIds: ['z-source', 'a-source', 'z-source'] } }));
  const before = structuredClone(input);
  for (const [target, method] of [[Date, 'now'], [Math, 'random'], [globalThis, 'fetch']]) {
    t.mock.method(target, method, () => { throw new Error(`Unexpected ambient dependency: ${method}`); });
  }
  const first = determineAction(input);
  const second = determineAction(input);
  assert.deepEqual(first, second);
  assert.deepEqual(input, before);
  assert.notEqual(first.risk.hardRiskFlags, input.hardRiskFlags);
  assert.notEqual(first.grounding.sourceIds, input.evidence.sourceIds);
  first.risk.hardRiskFlags.push('PAYMENT');
  first.grounding.sourceIds.push('changed');
  first.reasons[0].message = 'changed';
  assert.deepEqual(input, before);
  assert.deepEqual(first.auditEvent.recommendation, second.auditEvent.recommendation);
  assert.deepEqual(determineAction(input), second);
});

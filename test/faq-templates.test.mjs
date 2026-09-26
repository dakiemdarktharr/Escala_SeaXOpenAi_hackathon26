import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { retrieveKnowledge } from "../src/server/retrieval.mjs";
import { matchFaqTemplate } from "../src/server/faq-templates.mjs";

const knowledge = JSON.parse(await readFile(new URL("../data/demo/knowledge-base.json", import.meta.url), "utf8"));

function evidenceFor(message) {
  return retrieveKnowledge(message, knowledge, {
    asOf: "2026-10-31T10:00:00+07:00",
    limit: 4,
  }).evidence;
}

test("complete approved availability FAQ uses the deterministic answer path", () => {
  const message = "Is the Blue Linen Shirt available in size M, and how long is standard delivery?";
  const evidence = evidenceFor(message);
  const match = matchFaqTemplate(message, evidence);
  assert.equal(match?.intent, "product_and_shipping_faq");
  assert.match(match.draft, /2–4 business days/);
  assert.match(match.reason, /OpenAI request was skipped/);
});

test("known cotton-tote care instructions need no model phrasing", () => {
  const message = "How do I wash the cotton tote?";
  const match = matchFaqTemplate(message, evidenceFor(message));
  assert.equal(match?.intent, "product_care_faq");
  assert.match(match.draft, /Do not use bleach/);
});

test("a template never answers when one required evidence record is missing", () => {
  const message = "Is the Blue Linen Shirt available in size M, and how long is standard delivery?";
  const evidence = evidenceFor(message).filter((item) => item.id !== "kb-approved-answer-availability-v1");
  assert.equal(matchFaqTemplate(message, evidence), null);
});

test("an incomplete availability question does not match the complete FAQ template", () => {
  const message = "Is size M available?";
  assert.equal(matchFaqTemplate(message, evidenceFor(message)), null);
});
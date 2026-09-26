import test from "node:test";
import assert from "node:assert/strict";
import { retrieveKnowledge } from "../src/server/retrieval.mjs";

const active = (overrides = {}) => ({
  id: "doc-1",
  version: "1",
  title: "Blue linen shirt size M",
  content: "Size M is listed as available while stock remains.",
  type: "product_facts",
  status: "ACTIVE",
  effectiveFrom: "2026-10-01",
  sourceLabel: "demo",
  tags: ["blue-linen-shirt", "availability"],
  ...overrides,
});

test("retrieval ranks on topic terms and returns source/version evidence", () => {
  const result = retrieveKnowledge("Is the blue linen shirt available in size M?", [
    active(),
    active({ id: "doc-2", title: "Return policy", content: "Exchanges require order verification.", tags: ["returns"] }),
  ], { asOf: "2026-10-31T00:00:00Z" });
  assert.equal(result.status, "FOUND");
  assert.equal(result.evidence[0].id, "doc-1");
  assert.equal(result.evidence[0].version, "1");
});

test("retrieval excludes inactive, not-yet-effective, and unrelated documents", () => {
  const result = retrieveKnowledge("Is size M available?", [
    active(),
    active({ id: "future", effectiveFrom: "2026-11-01" }),
    active({ id: "inactive", status: "ARCHIVED" }),
    active({ id: "unrelated", title: "Refund policy", content: "Payments are reviewed by a seller.", tags: ["refund"] }),
  ], { asOf: "2026-10-31T00:00:00Z" });
  assert.deepEqual(result.evidence.map((item) => item.id), ["doc-1"]);
});

test("explicit active fact conflicts block normal retrieval", () => {
  const result = retrieveKnowledge("What are the store opening hours?", [
    active({ id: "hours-a", title: "Store hours", content: "The store opens at 9 AM.", tags: ["store-hours"], conflictGroup: "store-hours" }),
    active({ id: "hours-b", title: "Store hours", content: "The store opens at 10 AM.", tags: ["store-hours"], conflictGroup: "store-hours" }),
  ], { asOf: "2026-10-31T00:00:00Z" });
  assert.equal(result.status, "CONFLICTING");
  assert.equal(result.evidence.filter((item) => item.conflict).length, 2);
});

test("no lexical match is an explicit empty retrieval state", () => {
  const result = retrieveKnowledge("compatible replacement filter for Q9 purifier", [
    active(),
  ], { asOf: "2026-10-31T00:00:00Z" });
  assert.deepEqual(result, { status: "EMPTY", evidence: [] });
});
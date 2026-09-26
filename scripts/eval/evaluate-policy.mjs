import { readFile } from "node:fs/promises";
import { retrieveKnowledge } from "../../src/server/retrieval.mjs";
import { detectHardRisk } from "../../src/server/policy.mjs";
import { matchFaqTemplate } from "../../src/server/faq-templates.mjs";

const fixtures = JSON.parse(await readFile(new URL("../../data/eval/english-cases.json", import.meta.url), "utf8"));
const knowledge = JSON.parse(await readFile(new URL("../../data/demo/knowledge-base.json", import.meta.url), "utf8"));

// Explicit, deterministic corpus mutations probe evidence validity without a database.
function corpusFor(variant = "default") {
  const documents = structuredClone(knowledge);
  switch (variant) {
    case "default": return documents;
    case "empty": return [];
    case "archived": return documents.map((document) => ({ ...document, status: "ARCHIVED" }));
    case "future": return documents.map((document) => ({ ...document, effectiveFrom: "2099-01-01" }));
    case "missing_approved": return documents.filter((document) => document.id !== "kb-approved-answer-availability-v1");
    case "changed_care": return documents.map((document) => document.id === "kb-store-faq-v1" ? {
      ...document, version: "2.0", content: "The cotton tote is dry-clean only. Do not wash it with water.",
    } : document);
    case "conflicting_care": {
      const care = documents.find((document) => document.id === "kb-store-faq-v1");
      care.conflictGroup = "cotton-tote-care";
      documents.push({ ...care, id: "eval-conflicting-care", content: "The cotton tote must be dry-cleaned. Do not wash the cotton tote with water." });
      return documents;
    }
    default: throw new Error(`Unknown corpus variant: ${variant}`);
  }
}

// This deliberately evaluates only the pre-model gate using the production pure
// functions. MODEL_OR_SELLER_REVIEW means the offline measurement stops here.
function evaluateCase(example) {
  const retrieval = retrieveKnowledge(example.text, corpusFor(example.variant), { asOf: fixtures.asOf, limit: 4 });
  const risk = detectHardRisk(example.text);
  const template = matchFaqTemplate(example.text, retrieval.evidence);
  const route = risk.hard || retrieval.status === "EMPTY" || retrieval.status === "CONFLICTING"
    ? "ESCALATE" : template ? "AUTO_REPLY" : "MODEL_OR_SELLER_REVIEW";
  const passed = example.expectedRoute === "NO_AUTO_REPLY" ? route !== "AUTO_REPLY" : route === example.expectedRoute;
  return {
    id: example.id, group: example.group, expectedRoute: example.expectedRoute, route, passed,
    retrievalStatus: retrieval.status,
    evidenceIds: retrieval.evidence.map((item) => item.id),
    ...(route === "AUTO_REPLY" ? { draft: template.draft } : {}),
  };
}

function fraction(numerator, denominator) {
  return { numerator, denominator, percent: denominator ? Number((100 * numerator / denominator).toFixed(2)) : null };
}

const allowedGroups = new Set(["supported_faq", "hard_risk", "unsupported", "evidence_guard"]);
const ids = new Set();
for (const example of fixtures.cases) {
  if (!example.id || ids.has(example.id) || !example.text || !allowedGroups.has(example.group)
    || !["AUTO_REPLY", "ESCALATE", "NO_AUTO_REPLY"].includes(example.expectedRoute)) {
    throw new Error(`Invalid or duplicate fixture: ${example.id}`);
  }
  ids.add(example.id);
}
const results = fixtures.cases.map(evaluateCase);
const supported = results.filter((result) => result.group === "supported_faq");
const risk = results.filter((result) => result.group === "hard_risk");
const unsupported = results.filter((result) => result.group === "unsupported");
const guards = results.filter((result) => result.group === "evidence_guard");
const completedWithoutModel = results.filter((result) => result.route !== "MODEL_OR_SELLER_REVIEW");
const report = {
  suite: fixtures.id, provenance: fixtures.provenance, asOf: fixtures.asOf,
  scope: "Offline pre-model routing only. AUTO_REPLY is eligibility, not an external message send. No OpenAI, MongoDB, network, latency, dollar-cost, or live seller-performance measurement.",
  metrics: {
    fixtureExpectationPassRate: fraction(results.filter((result) => result.passed).length, results.length),
    supportedFaqCoverage: fraction(supported.filter((result) => result.route === "AUTO_REPLY").length, supported.length),
    preModelDecisionRate: fraction(completedWithoutModel.length, results.length),
    deterministicFaqRate: fraction(results.filter((result) => result.route === "AUTO_REPLY").length, results.length),
    hardRiskEscalation: fraction(risk.filter((result) => result.route === "ESCALATE").length, risk.length),
    unsupportedAbstention: fraction(unsupported.filter((result) => result.route !== "AUTO_REPLY").length, unsupported.length),
    evidenceGuardPass: fraction(guards.filter((result) => result.passed).length, guards.length),
    falseAutoReply: fraction(results.filter((result) => result.expectedRoute !== "AUTO_REPLY" && result.route === "AUTO_REPLY").length, results.filter((result) => result.expectedRoute !== "AUTO_REPLY").length),
  },
  openaiCallsMadeByEvaluator: 0,
  results,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`${report.suite}\n${report.provenance}\n${report.scope}\n`);
  for (const [name, value] of Object.entries(report.metrics)) {
    console.log(`${name}: ${value.numerator}/${value.denominator} (${value.percent ?? "n/a"}%)`);
  }
  console.log("OpenAI API calls made: 0");
  const failed = results.filter((result) => !result.passed);
  console.log(`\nFailed expectations: ${failed.length}`);
  for (const result of failed) console.log(`- ${result.id}: expected ${result.expectedRoute}, observed ${result.route}`);
}
if (results.some((result) => !result.passed)) process.exitCode = 1;

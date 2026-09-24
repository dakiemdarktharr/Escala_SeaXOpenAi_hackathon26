import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const messagesPath = resolve(root, "data/demo/messages.json");
const knowledgePath = resolve(root, "data/demo/knowledge-base.json");

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const messages = await readJson(messagesPath);
const knowledgeBase = await readJson(knowledgePath);

const allowedActions = new Set([
  "AUTO_REPLY",
  "DRAFT_FOR_SELLER",
  "ASK_CLARIFICATION",
  "ESCALATE",
]);
const messageIds = new Set(messages.map((message) => message.id));
const evidenceIds = new Set(knowledgeBase.map((document) => document.id));

if (!messages.length || !knowledgeBase.length) {
  throw new Error("Demo fixtures must contain at least one message and one knowledge document.");
}

for (const message of messages) {
  if (!message.id || !message.text || !message.expectedAction) {
    throw new Error(`Message is missing id, text, or expectedAction: ${JSON.stringify(message)}`);
  }
  if (!allowedActions.has(message.expectedAction)) {
    throw new Error(`Unsupported expected action for ${message.id}: ${message.expectedAction}`);
  }
  for (const evidenceId of message.expectedEvidenceIds ?? []) {
    if (!evidenceIds.has(evidenceId)) {
      throw new Error(`Message ${message.id} references missing evidence ${evidenceId}.`);
    }
  }
}

for (const document of knowledgeBase) {
  if (!document.id || !document.version || !document.title || !document.content) {
    throw new Error(`Knowledge document is missing required fields: ${JSON.stringify(document)}`);
  }
}

const requiredScenarios = new Set([
  "safe_faq",
  "ambiguous",
  "high_risk_payment",
  "urgent_deadline",
  "missing_evidence",
  "model_failure",
]);
const actualScenarios = new Set(messages.map((message) => message.scenario));
for (const scenario of requiredScenarios) {
  if (!actualScenarios.has(scenario)) {
    throw new Error(`Missing required demo scenario: ${scenario}`);
  }
}

if (messageIds.size !== messages.length || evidenceIds.size !== knowledgeBase.length) {
  throw new Error("Demo fixture IDs must be unique.");
}

console.log(`Demo data valid: ${messages.length} messages, ${knowledgeBase.length} knowledge documents.`);

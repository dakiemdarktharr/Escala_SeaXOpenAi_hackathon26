import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Collection } from "mongodb";
import type { RiskLevel } from "@/domain/contracts";
import {
  getAuditCollection,
  getKnowledgeBaseCollection,
  getRecommendationsCollection,
  getThreadsCollection,
} from "./mongodb";
import type { KnowledgeBaseRecord, SyntheticThreadRecord } from "./mongodb";

export interface DemoMessageFixture {
  id: string;
  threadId: string;
  scenario: string;
  receivedAt: string;
  channel: string;
  customerLabel: string;
  text: string;
  expectedIntent: string | null;
  expectedAction: string;
  expectedUrgency: string;
  expectedUrgencyReasons: string[];
}

let messageFixturesPromise: Promise<DemoMessageFixture[]> | null = null;

export function getDemoMessages(): Promise<DemoMessageFixture[]> {
  if (!messageFixturesPromise) {
    const root = process.cwd();
    messageFixturesPromise = readFile(
      path.join(root, "data", "demo", "messages.json"),
      "utf8",
    )
      .then((raw) => JSON.parse(raw) as DemoMessageFixture[])
      .catch((error: unknown) => {
        messageFixturesPromise = null;
        throw error;
      });
  }
  return messageFixturesPromise;
}

function toThread(fixture: DemoMessageFixture): SyntheticThreadRecord {
  const urgency = fixture.expectedUrgency?.toLowerCase();
  return {
    id: fixture.threadId,
    buyerName: fixture.customerLabel,
    preview: fixture.text,
    updatedAt: fixture.receivedAt,
    unread: true,
    intent: fixture.expectedIntent ?? "unknown",
    urgency: (urgency === "low" || urgency === "medium" || urgency === "high"
      ? urgency
      : "low") as RiskLevel,
    urgencyReasons: fixture.expectedUrgencyReasons ?? [],
    scenario: fixture.scenario,
    channel: fixture.channel,
  };
}

/** Idempotently upsert records keyed by their unique `id` field. */
async function upsertById<T extends { id: string }>(
  collection: Collection<T>,
  records: T[],
): Promise<number> {
  if (records.length === 0) {
    return 0;
  }

  await collection.createIndex({ id: 1 }, { unique: true });

  await collection.bulkWrite(
    records.map((record) => ({
      updateOne: {
        filter: { id: record.id } as never,
        update: { $setOnInsert: record },
        upsert: true,
      },
    })),
  );

  return records.length;
}

/**
 * Seed the demo data into MongoDB. Idempotent: re-runs upsert by `_id` and
 * never overwrite an existing record or log its contents.
 */
export async function seedDatabase(): Promise<{ threads: number; knowledgeBase: number }> {
  const root = process.cwd();

  const [messages, knowledgeRaw] = await Promise.all([
    getDemoMessages(),
    readFile(path.join(root, "data", "demo", "knowledge-base.json"), "utf8"),
  ]);

  const knowledgeBase = JSON.parse(knowledgeRaw) as KnowledgeBaseRecord[];

  const threads = messages.map(toThread);

  const [threadsCount, knowledgeCount] = await Promise.all([
    upsertById(await getThreadsCollection(), threads),
    upsertById(await getKnowledgeBaseCollection(), knowledgeBase),
  ]);

  return { threads: threadsCount, knowledgeBase: knowledgeCount };
}

export {
  getAuditCollection,
  getKnowledgeBaseCollection,
  getRecommendationsCollection,
  getThreadsCollection,
};

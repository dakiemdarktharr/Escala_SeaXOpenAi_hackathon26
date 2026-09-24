import { MongoClient } from "mongodb";
import type { Collection, Db } from "mongodb";
import type {
  AuditRecord,
  RecommendationRecord,
  RiskLevel,
} from "@/domain/contracts";

/** A synthetic inbox thread persisted for the demo seed. */
export interface SyntheticThreadRecord {
  id: string;
  buyerName: string;
  preview: string;
  updatedAt: string;
  unread: boolean;
  intent: string;
  urgency: RiskLevel;
  urgencyReasons: string[];
  scenario: string;
  channel: string;
}

/** A synthetic knowledge-base entry persisted for the demo seed. */
export interface KnowledgeBaseRecord {
  id: string;
  version: string;
  title: string;
  type: string;
  status: string;
  effectiveFrom: string;
  sourceLabel: string;
  updatedAt: string;
  tags: string[];
  content: string;
}

const DB_NAME = process.env.MONGODB_DB || "escala";
const SERVER_SELECTION_TIMEOUT_MS = 3000;

let clientPromise: Promise<MongoClient> | null = null;

/**
 * Cached MongoClient connection. Rejects without touching the network when
 * `MONGODB_URI` is unset, and resets the cache on a failed connection so a
 * later health probe can retry.
 */
export function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error("MONGODB_URI is not configured"));
  }

  if (!clientPromise) {
    clientPromise = new MongoClient(uri, {
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      connectTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    })
      .connect()
      .catch((err: unknown) => {
        clientPromise = null;
        throw err;
      });
  }

  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(DB_NAME);
}

export async function getThreadsCollection(): Promise<Collection<SyntheticThreadRecord>> {
  const db = await getDb();
  return db.collection<SyntheticThreadRecord>("threads");
}

export async function getRecommendationsCollection(): Promise<Collection<RecommendationRecord>> {
  const db = await getDb();
  return db.collection<RecommendationRecord>("recommendations");
}

export async function getAuditCollection(): Promise<Collection<AuditRecord>> {
  const db = await getDb();
  return db.collection<AuditRecord>("audit");
}

export async function getKnowledgeBaseCollection(): Promise<Collection<KnowledgeBaseRecord>> {
  const db = await getDb();
  return db.collection<KnowledgeBaseRecord>("knowledge_base");
}

/**
 * Report database reachability as a boolean. Never surfaces connection
 * strings, credentials, or driver error details to callers.
 */
export async function pingDatabase(): Promise<boolean> {
  try {
    const client = await getClient();
    await client.db(DB_NAME).command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

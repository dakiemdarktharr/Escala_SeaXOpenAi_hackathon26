import { NextResponse } from "next/server";
import type { HealthResponse } from "@/domain/contracts";
import { pingDatabase } from "@/server/mongodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const databaseUp = await pingDatabase();

  const llm: HealthResponse["services"]["llm"] = process.env.OPENAI_API_KEY
    ? "configured"
    : "fallback";

  const body: HealthResponse = {
    status: databaseUp ? "ok" : "degraded",
    services: {
      database: databaseUp ? "connected" : "unavailable",
      llm,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body);
}

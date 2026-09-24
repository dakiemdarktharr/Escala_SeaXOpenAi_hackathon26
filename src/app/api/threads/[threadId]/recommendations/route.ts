import { createRecommendation, jsonError } from "@/server/inbox-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  _request: Request,
  context: { params: Promise<{ threadId: string }> },
): Promise<Response> {
  try {
    const { threadId } = await context.params;
    return Response.json(await createRecommendation(threadId), { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}

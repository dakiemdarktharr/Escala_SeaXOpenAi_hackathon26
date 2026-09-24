import { getThreadDetail, jsonError } from "@/server/inbox-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ threadId: string }> },
): Promise<Response> {
  try {
    const { threadId } = await context.params;
    return Response.json(await getThreadDetail(threadId), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return jsonError(error);
  }
}

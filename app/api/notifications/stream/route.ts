import { getAuthToken } from "@/helpers/__helper";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const backendUrl = `${process.env.BASE_URL}/notifications/stream`;
    const backendRes = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      },
    });

    if (!backendRes.ok || !backendRes.body) {
      return new Response("SSE stream connection failed", { status: backendRes.status });
    }

    return new Response(backendRes.body as any, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return new Response(err.message || "SSE Error", { status: 500 });
  }
}

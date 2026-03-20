import { NextResponse } from "next/server";
import { SocraticTurnRequestSchema } from "@/features/learning/lib/schemas";
import { checkRateLimit } from "@/shared/lib/rate-limiter";
import {
  createSession,
  getSession,
  appendMessage,
} from "@/features/learning/lib/diagnostic-repository";
import { diagnosticAgent } from "@/mastra/agents/diagnostic";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = SocraticTurnRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { topicId, sessionId, userMessage } = parsed.data;

  const rateLimit = await checkRateLimit("diagnostic");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        remaining: rateLimit.remaining,
        limit: rateLimit.limit,
      },
      { status: 429 }
    );
  }

  let session;
  if (sessionId) {
    session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }
  } else {
    session = await createSession(topicId, "socratic");
  }

  await appendMessage(session.id, { role: "user", content: userMessage });

  const conversationHistory = session.messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = conversationHistory
    ? `${conversationHistory}\nuser: ${userMessage}`
    : userMessage;

  const streamResult = await diagnosticAgent.stream(prompt, {
    maxSteps: 2,
  });

  return new Response(streamResult.textStream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Session-Id": session.id,
    },
  });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/shared/lib/rate-limiter";
import { createSession } from "@/features/learning/lib/diagnostic-repository";
import { diagnosticAgent } from "@/mastra/agents/diagnostic";

const QuizRequestSchema = z.object({
  topicId: z.string().min(1),
  topicTitle: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = QuizRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { topicId, topicTitle } = parsed.data;

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

  const session = await createSession(topicId, "quiz");

  const streamResult = await diagnosticAgent.stream(
    `Generate a diagnostic quiz for the topic: "${topicTitle}". Use QUIZ MODE as described in your instructions. Return the questions as structured JSON.`,
    { maxSteps: 1 }
  );

  return new Response(streamResult.textStream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Session-Id": session.id,
    },
  });
}

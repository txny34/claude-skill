import { NextResponse } from "next/server";
import {
  DiagnosticCompleteRequestSchema,
  KnowledgeProfileOutputSchema,
} from "@/features/learning/lib/schemas";
import {
  getSession,
  completeSession,
} from "@/features/learning/lib/diagnostic-repository";
import { createProfile } from "@/features/learning/lib/knowledge-profile-repository";
import { diagnosticAgent } from "@/mastra/agents/diagnostic";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = DiagnosticCompleteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { sessionId, topicId, answers } = parsed.data;

  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  let assessmentPrompt: string;

  if (session.mode === "socratic") {
    const conversationSummary = session.messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");
    assessmentPrompt = `Based on this Socratic interview about the topic, produce a knowledge profile assessment.\n\nConversation:\n${conversationSummary}\n\nProduce your assessment as a structured JSON object with: level, strengths, weaknesses, misconceptions, rawAssessment.`;
  } else {
    assessmentPrompt = `Based on this quiz session, the user provided these answers: ${JSON.stringify(answers)}.\n\nEvaluate their knowledge and produce a structured JSON object with: level, strengths, weaknesses, misconceptions, rawAssessment.`;
  }

  const conversationContext = session.messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const fullPrompt = `${conversationContext}\n\n${assessmentPrompt}`;

  const result = await diagnosticAgent.generate(fullPrompt, {
    output: KnowledgeProfileOutputSchema,
  });

  const profileData = result.object;
  const profile = await createProfile(topicId, profileData);
  await completeSession(sessionId);

  return NextResponse.json({ profile });
}

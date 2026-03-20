import { prisma } from "@/shared/lib/db-client";
import type {
  DiagnosticMode,
  DiagnosticMessage,
  DiagnosticSession,
} from "@/features/learning/types/diagnostic";

interface DbSession {
  id: string;
  topicId: string;
  mode: string;
  status: string;
  messages: string;
}

function toDomain(row: DbSession): DiagnosticSession {
  return {
    id: row.id,
    topicId: row.topicId,
    mode: row.mode as DiagnosticMode,
    status: row.status as DiagnosticSession["status"],
    messages: JSON.parse(row.messages) as DiagnosticMessage[],
  };
}

export async function createSession(
  topicId: string,
  mode: DiagnosticMode
): Promise<DiagnosticSession> {
  const row = await prisma.diagnosticSession.create({
    data: { topicId, mode },
  });
  return toDomain(row);
}

export async function getSession(
  sessionId: string
): Promise<DiagnosticSession | null> {
  const row = await prisma.diagnosticSession.findUnique({
    where: { id: sessionId },
  });
  return row ? toDomain(row) : null;
}

export async function appendMessage(
  sessionId: string,
  message: DiagnosticMessage
): Promise<DiagnosticSession> {
  const existing = await prisma.diagnosticSession.findUnique({
    where: { id: sessionId },
  });
  if (!existing) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const messages = [
    ...(JSON.parse(existing.messages) as DiagnosticMessage[]),
    message,
  ];

  const updated = await prisma.diagnosticSession.update({
    where: { id: sessionId },
    data: { messages: JSON.stringify(messages) },
  });
  return toDomain(updated);
}

export async function completeSession(
  sessionId: string
): Promise<DiagnosticSession> {
  const updated = await prisma.diagnosticSession.update({
    where: { id: sessionId },
    data: { status: "completed" },
  });
  return toDomain(updated);
}

export async function getInProgressSession(
  topicId: string
): Promise<DiagnosticSession | null> {
  const row = await prisma.diagnosticSession.findFirst({
    where: { topicId, status: "in_progress" },
    orderBy: { createdAt: "desc" },
  });
  return row ? toDomain(row) : null;
}

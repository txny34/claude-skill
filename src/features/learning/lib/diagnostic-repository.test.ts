import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createSession,
  getSession,
  appendMessage,
  completeSession,
  getInProgressSession,
} from "./diagnostic-repository";
import type { DiagnosticMode, DiagnosticMessage } from "@/features/learning/types/diagnostic";

const mockPrisma = vi.hoisted(() => ({
  diagnosticSession: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
  },
}));

vi.mock("@/shared/lib/db-client", () => ({
  prisma: mockPrisma,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createSession", () => {
  it("creates a new diagnostic session", async () => {
    const dbRow = {
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "in_progress",
      messages: "[]",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.diagnosticSession.create.mockResolvedValue(dbRow);

    const result = await createSession("topic1", "socratic");

    expect(mockPrisma.diagnosticSession.create).toHaveBeenCalledWith({
      data: { topicId: "topic1", mode: "socratic" },
    });
    expect(result).toEqual({
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "in_progress",
      messages: [],
    });
  });
});

describe("getSession", () => {
  it("returns parsed session with messages", async () => {
    const messages: DiagnosticMessage[] = [
      { role: "assistant", content: "Hello" },
      { role: "user", content: "Hi" },
    ];
    mockPrisma.diagnosticSession.findUnique.mockResolvedValue({
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "in_progress",
      messages: JSON.stringify(messages),
    });

    const result = await getSession("sess1");

    expect(result).toEqual({
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "in_progress",
      messages,
    });
  });

  it("returns null for non-existent session", async () => {
    mockPrisma.diagnosticSession.findUnique.mockResolvedValue(null);

    const result = await getSession("nonexistent");

    expect(result).toBeNull();
  });
});

describe("appendMessage", () => {
  it("appends a message to existing session messages", async () => {
    const existing = [{ role: "assistant" as const, content: "Hello" }];
    const newMsg: DiagnosticMessage = { role: "user", content: "Hi there" };

    mockPrisma.diagnosticSession.findUnique.mockResolvedValue({
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "in_progress",
      messages: JSON.stringify(existing),
    });
    mockPrisma.diagnosticSession.update.mockResolvedValue({
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "in_progress",
      messages: JSON.stringify([...existing, newMsg]),
    });

    const result = await appendMessage("sess1", newMsg);

    expect(mockPrisma.diagnosticSession.update).toHaveBeenCalledWith({
      where: { id: "sess1" },
      data: { messages: JSON.stringify([...existing, newMsg]) },
    });
    expect(result.messages).toHaveLength(2);
    expect(result.messages[1]).toEqual(newMsg);
  });
});

describe("completeSession", () => {
  it("marks session as completed", async () => {
    mockPrisma.diagnosticSession.update.mockResolvedValue({
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "completed",
      messages: "[]",
    });

    const result = await completeSession("sess1");

    expect(mockPrisma.diagnosticSession.update).toHaveBeenCalledWith({
      where: { id: "sess1" },
      data: { status: "completed" },
    });
    expect(result.status).toBe("completed");
  });
});

describe("getInProgressSession", () => {
  it("returns in-progress session for topic", async () => {
    mockPrisma.diagnosticSession.findFirst.mockResolvedValue({
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "in_progress",
      messages: "[]",
    });

    const result = await getInProgressSession("topic1");

    expect(mockPrisma.diagnosticSession.findFirst).toHaveBeenCalledWith({
      where: { topicId: "topic1", status: "in_progress" },
      orderBy: { createdAt: "desc" },
    });
    expect(result).not.toBeNull();
    expect(result!.status).toBe("in_progress");
  });

  it("returns null when no in-progress session exists", async () => {
    mockPrisma.diagnosticSession.findFirst.mockResolvedValue(null);

    const result = await getInProgressSession("topic1");

    expect(result).toBeNull();
  });
});

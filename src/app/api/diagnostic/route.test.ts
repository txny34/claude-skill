import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before imports
const mockCheckRateLimit = vi.hoisted(() => vi.fn());
const mockRecordUsage = vi.hoisted(() => vi.fn());
const mockCreateSession = vi.hoisted(() => vi.fn());
const mockGetSession = vi.hoisted(() => vi.fn());
const mockAppendMessage = vi.hoisted(() => vi.fn());
const mockGetInProgressSession = vi.hoisted(() => vi.fn());
const mockDiagnosticAgent = vi.hoisted(() => ({
  stream: vi.fn(),
}));

vi.mock("@/shared/lib/rate-limiter", () => ({
  checkRateLimit: mockCheckRateLimit,
  recordUsage: mockRecordUsage,
}));

vi.mock("@/features/learning/lib/diagnostic-repository", () => ({
  createSession: mockCreateSession,
  getSession: mockGetSession,
  appendMessage: mockAppendMessage,
  getInProgressSession: mockGetInProgressSession,
}));

vi.mock("@/mastra/agents/diagnostic", () => ({
  diagnosticAgent: mockDiagnosticAgent,
}));

import { POST } from "./route";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/diagnostic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/diagnostic", () => {
  it("rejects invalid request body", async () => {
    const req = makeRequest({ topicId: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects when rate limited", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      limit: 10,
    });

    const req = makeRequest({
      topicId: "topic1",
      userMessage: "Hello",
    });
    const res = await POST(req);

    expect(res.status).toBe(429);
  });

  it("creates a new session on first turn (no sessionId)", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 9,
      limit: 10,
    });
    mockCreateSession.mockResolvedValue({
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "in_progress",
      messages: [],
    });
    mockAppendMessage.mockResolvedValue({
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "in_progress",
      messages: [{ role: "user", content: "Hello" }],
    });

    const mockStream = {
      textStream: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("Hello"));
          controller.close();
        },
      }),
    };
    mockDiagnosticAgent.stream.mockResolvedValue(mockStream);

    const req = makeRequest({
      topicId: "topic1",
      userMessage: "Hello",
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("X-Session-Id")).toBe("sess1");
    expect(mockCreateSession).toHaveBeenCalledWith("topic1", "socratic");
  });

  it("uses existing session when sessionId provided", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 9,
      limit: 10,
    });
    mockGetSession.mockResolvedValue({
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "in_progress",
      messages: [
        { role: "assistant", content: "What do you know about React?" },
      ],
    });
    mockAppendMessage.mockResolvedValue({
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "in_progress",
      messages: [
        { role: "assistant", content: "What do you know about React?" },
        { role: "user", content: "I know hooks" },
      ],
    });

    const mockStream = {
      textStream: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("response"));
          controller.close();
        },
      }),
    };
    mockDiagnosticAgent.stream.mockResolvedValue(mockStream);

    const req = makeRequest({
      topicId: "topic1",
      sessionId: "sess1",
      userMessage: "I know hooks",
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockGetSession).toHaveBeenCalledWith("sess1");
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it("returns 404 for non-existent session", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 9,
      limit: 10,
    });
    mockGetSession.mockResolvedValue(null);

    const req = makeRequest({
      topicId: "topic1",
      sessionId: "nonexistent",
      userMessage: "Hello",
    });
    const res = await POST(req);

    expect(res.status).toBe(404);
  });
});

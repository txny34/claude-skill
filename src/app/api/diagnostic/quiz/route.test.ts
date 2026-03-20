import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCheckRateLimit = vi.hoisted(() => vi.fn());
const mockCreateSession = vi.hoisted(() => vi.fn());
const mockDiagnosticAgent = vi.hoisted(() => ({
  stream: vi.fn(),
}));

vi.mock("@/shared/lib/rate-limiter", () => ({
  checkRateLimit: mockCheckRateLimit,
}));

vi.mock("@/features/learning/lib/diagnostic-repository", () => ({
  createSession: mockCreateSession,
}));

vi.mock("@/mastra/agents/diagnostic", () => ({
  diagnosticAgent: mockDiagnosticAgent,
}));

import { POST } from "./route";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/diagnostic/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/diagnostic/quiz", () => {
  it("rejects missing topicId", async () => {
    const req = makeRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("rejects when rate limited", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      limit: 10,
    });
    const req = makeRequest({ topicId: "topic1", topicTitle: "React" });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("creates session and streams quiz generation", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      remaining: 9,
      limit: 10,
    });
    mockCreateSession.mockResolvedValue({
      id: "sess1",
      topicId: "topic1",
      mode: "quiz",
      status: "in_progress",
      messages: [],
    });

    const mockStream = {
      textStream: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("quiz data"));
          controller.close();
        },
      }),
    };
    mockDiagnosticAgent.stream.mockResolvedValue(mockStream);

    const req = makeRequest({ topicId: "topic1", topicTitle: "React" });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockCreateSession).toHaveBeenCalledWith("topic1", "quiz");
  });
});

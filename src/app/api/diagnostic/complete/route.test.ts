import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.hoisted(() => vi.fn());
const mockCompleteSession = vi.hoisted(() => vi.fn());
const mockGetProfileByTopicId = vi.hoisted(() => vi.fn());
const mockCreateProfile = vi.hoisted(() => vi.fn());
const mockDiagnosticAgent = vi.hoisted(() => ({
  generate: vi.fn(),
}));

vi.mock("@/features/learning/lib/diagnostic-repository", () => ({
  getSession: mockGetSession,
  completeSession: mockCompleteSession,
}));

vi.mock("@/features/learning/lib/knowledge-profile-repository", () => ({
  getProfileByTopicId: mockGetProfileByTopicId,
  createProfile: mockCreateProfile,
}));

vi.mock("@/mastra/agents/diagnostic", () => ({
  diagnosticAgent: mockDiagnosticAgent,
}));

import { POST } from "./route";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/diagnostic/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/diagnostic/complete", () => {
  it("rejects invalid request", async () => {
    const req = makeRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existent session", async () => {
    mockGetSession.mockResolvedValue(null);

    const req = makeRequest({ sessionId: "sess1", topicId: "topic1" });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("completes socratic session and generates profile", async () => {
    mockGetSession.mockResolvedValue({
      id: "sess1",
      topicId: "topic1",
      mode: "socratic",
      status: "in_progress",
      messages: [
        { role: "assistant", content: "What do you know?" },
        { role: "user", content: "I know hooks" },
      ],
    });

    const profileData = {
      level: "intermediate",
      strengths: ["React hooks"],
      weaknesses: ["Server components"],
      misconceptions: [],
      rawAssessment: "Solid fundamentals.",
    };

    mockDiagnosticAgent.generate.mockResolvedValue({
      object: profileData,
    });

    mockCreateProfile.mockResolvedValue(profileData);
    mockCompleteSession.mockResolvedValue({
      id: "sess1",
      status: "completed",
    });

    const req = makeRequest({ sessionId: "sess1", topicId: "topic1" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.profile).toEqual(profileData);
    expect(mockCompleteSession).toHaveBeenCalledWith("sess1");
    expect(mockCreateProfile).toHaveBeenCalledWith("topic1", profileData);
  });

  it("completes quiz session with answers", async () => {
    mockGetSession.mockResolvedValue({
      id: "sess1",
      topicId: "topic1",
      mode: "quiz",
      status: "in_progress",
      messages: [],
    });

    const profileData = {
      level: "beginner",
      strengths: [],
      weaknesses: ["Everything"],
      misconceptions: ["Closures are classes"],
      rawAssessment: "Needs work.",
    };

    mockDiagnosticAgent.generate.mockResolvedValue({
      object: profileData,
    });

    mockCreateProfile.mockResolvedValue(profileData);
    mockCompleteSession.mockResolvedValue({
      id: "sess1",
      status: "completed",
    });

    const req = makeRequest({
      sessionId: "sess1",
      topicId: "topic1",
      answers: [0, 1, 2, 3],
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockDiagnosticAgent.generate).toHaveBeenCalled();
  });
});

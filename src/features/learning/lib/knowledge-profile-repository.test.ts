import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createProfile,
  getProfileByTopicId,
  hasProfile,
} from "./knowledge-profile-repository";
import type { KnowledgeProfileOutput } from "@/features/learning/lib/schemas";

const mockPrisma = vi.hoisted(() => ({
  knowledgeProfile: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("@/shared/lib/db-client", () => ({
  prisma: mockPrisma,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const sampleProfile: KnowledgeProfileOutput = {
  level: "intermediate",
  strengths: ["React hooks", "State management"],
  weaknesses: ["Server components"],
  misconceptions: ["useEffect is synchronous"],
  rawAssessment: "Solid React fundamentals...",
};

describe("createProfile", () => {
  it("persists a knowledge profile with JSON serialization", async () => {
    mockPrisma.knowledgeProfile.create.mockResolvedValue({
      id: "kp1",
      topicId: "topic1",
      level: "intermediate",
      strengths: JSON.stringify(sampleProfile.strengths),
      weaknesses: JSON.stringify(sampleProfile.weaknesses),
      misconceptions: JSON.stringify(sampleProfile.misconceptions),
      rawAssessment: sampleProfile.rawAssessment,
      createdAt: new Date(),
    });

    const result = await createProfile("topic1", sampleProfile);

    expect(mockPrisma.knowledgeProfile.create).toHaveBeenCalledWith({
      data: {
        topicId: "topic1",
        level: sampleProfile.level,
        strengths: JSON.stringify(sampleProfile.strengths),
        weaknesses: JSON.stringify(sampleProfile.weaknesses),
        misconceptions: JSON.stringify(sampleProfile.misconceptions),
        rawAssessment: sampleProfile.rawAssessment,
      },
    });
    expect(result.strengths).toEqual(sampleProfile.strengths);
    expect(result.weaknesses).toEqual(sampleProfile.weaknesses);
  });
});

describe("getProfileByTopicId", () => {
  it("returns deserialized profile", async () => {
    mockPrisma.knowledgeProfile.findUnique.mockResolvedValue({
      id: "kp1",
      topicId: "topic1",
      level: "intermediate",
      strengths: JSON.stringify(sampleProfile.strengths),
      weaknesses: JSON.stringify(sampleProfile.weaknesses),
      misconceptions: JSON.stringify(sampleProfile.misconceptions),
      rawAssessment: sampleProfile.rawAssessment,
      createdAt: new Date(),
    });

    const result = await getProfileByTopicId("topic1");

    expect(result).not.toBeNull();
    expect(result!.level).toBe("intermediate");
    expect(result!.strengths).toEqual(sampleProfile.strengths);
  });

  it("returns null for non-existent topic", async () => {
    mockPrisma.knowledgeProfile.findUnique.mockResolvedValue(null);

    const result = await getProfileByTopicId("nonexistent");

    expect(result).toBeNull();
  });
});

describe("hasProfile", () => {
  it("returns true when profile exists", async () => {
    mockPrisma.knowledgeProfile.findUnique.mockResolvedValue({
      id: "kp1",
    });

    const result = await hasProfile("topic1");

    expect(result).toBe(true);
  });

  it("returns false when no profile", async () => {
    mockPrisma.knowledgeProfile.findUnique.mockResolvedValue(null);

    const result = await hasProfile("topic1");

    expect(result).toBe(false);
  });
});

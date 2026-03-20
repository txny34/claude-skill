import { describe, it, expect } from "vitest";
import {
  SocraticTurnRequestSchema,
  SocraticTurnResponseSchema,
  QuizQuestionSchema,
  QuizGenerationResponseSchema,
  KnowledgeProfileOutputSchema,
  DiagnosticCompleteRequestSchema,
} from "./schemas";

describe("SocraticTurnRequestSchema", () => {
  it("validates a valid first turn (no sessionId)", () => {
    const input = { topicId: "abc123", userMessage: "I know some React basics" };
    const result = SocraticTurnRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("validates a valid subsequent turn (with sessionId)", () => {
    const input = {
      topicId: "abc123",
      sessionId: "sess456",
      userMessage: "I use useEffect for side effects",
    };
    const result = SocraticTurnRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects empty userMessage", () => {
    const input = { topicId: "abc123", userMessage: "" };
    const result = SocraticTurnRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects missing topicId", () => {
    const input = { userMessage: "hello" };
    const result = SocraticTurnRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("SocraticTurnResponseSchema", () => {
  it("validates a valid response", () => {
    const input = {
      assistantMessage: "What do you know about hooks?",
      questionNumber: 1,
      isComplete: false,
    };
    const result = SocraticTurnResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("validates a complete response", () => {
    const input = {
      assistantMessage: "Thanks, I have enough to assess you.",
      questionNumber: 6,
      isComplete: true,
    };
    const result = SocraticTurnResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects negative questionNumber", () => {
    const input = {
      assistantMessage: "Hello",
      questionNumber: -1,
      isComplete: false,
    };
    const result = SocraticTurnResponseSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("QuizQuestionSchema", () => {
  it("validates a valid quiz question", () => {
    const input = {
      question: "What is a closure?",
      options: [
        "A function with access to its outer scope",
        "A class method",
        "A loop construct",
        "A type of variable",
      ],
      correctIndex: 0,
      difficulty: "intermediate" as const,
    };
    const result = QuizQuestionSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects correctIndex out of range", () => {
    const input = {
      question: "What is a closure?",
      options: ["A", "B", "C", "D"],
      correctIndex: 5,
      difficulty: "beginner" as const,
    };
    const result = QuizQuestionSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects fewer than 2 options", () => {
    const input = {
      question: "What is a closure?",
      options: ["Only one"],
      correctIndex: 0,
      difficulty: "beginner" as const,
    };
    const result = QuizQuestionSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("QuizGenerationResponseSchema", () => {
  it("validates a valid quiz with multiple questions", () => {
    const input = {
      questions: [
        {
          question: "Q1?",
          options: ["A", "B", "C", "D"],
          correctIndex: 0,
          difficulty: "beginner" as const,
        },
        {
          question: "Q2?",
          options: ["A", "B", "C"],
          correctIndex: 2,
          difficulty: "advanced" as const,
        },
      ],
    };
    const result = QuizGenerationResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects empty questions array", () => {
    const input = { questions: [] };
    const result = QuizGenerationResponseSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("KnowledgeProfileOutputSchema", () => {
  it("validates a complete profile", () => {
    const input = {
      level: "intermediate",
      strengths: ["React hooks", "State management"],
      weaknesses: ["Server components", "Suspense"],
      misconceptions: ["useEffect runs synchronously"],
      rawAssessment: "The user has a solid grasp of React basics...",
    };
    const result = KnowledgeProfileOutputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects invalid level", () => {
    const input = {
      level: "expert",
      strengths: [],
      weaknesses: [],
      misconceptions: [],
      rawAssessment: "test",
    };
    const result = KnowledgeProfileOutputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts empty arrays for strengths/weaknesses/misconceptions", () => {
    const input = {
      level: "beginner",
      strengths: [],
      weaknesses: [],
      misconceptions: [],
      rawAssessment: "New to the topic",
    };
    const result = KnowledgeProfileOutputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});

describe("DiagnosticCompleteRequestSchema", () => {
  it("validates socratic completion", () => {
    const input = { sessionId: "sess123", topicId: "topic456" };
    const result = DiagnosticCompleteRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("validates quiz completion with answers", () => {
    const input = {
      sessionId: "sess123",
      topicId: "topic456",
      answers: [0, 2, 1, 3],
    };
    const result = DiagnosticCompleteRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects missing sessionId", () => {
    const input = { topicId: "topic456" };
    const result = DiagnosticCompleteRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

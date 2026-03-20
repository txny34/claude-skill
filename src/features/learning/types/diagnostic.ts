export type DiagnosticMode = "socratic" | "quiz";

export type KnowledgeLevel = "beginner" | "intermediate" | "advanced";

export interface DiagnosticMessage {
  role: "user" | "assistant";
  content: string;
}

export interface KnowledgeProfile {
  level: KnowledgeLevel;
  strengths: string[];
  weaknesses: string[];
  misconceptions: string[];
  rawAssessment: string;
}

export interface DiagnosticSession {
  id: string;
  topicId: string;
  mode: DiagnosticMode;
  status: "in_progress" | "completed";
  messages: DiagnosticMessage[];
}

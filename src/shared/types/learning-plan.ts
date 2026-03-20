export interface LearningPiece {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  learningObjectives: string[];
  estimatedMinutes: number;
  status: PieceStatus;
}

export type PieceStatus =
  | "pending"
  | "content_ready"
  | "in_progress"
  | "completed"
  | "needs_regen";

export interface LearningPlan {
  id: string;
  topicId: string;
  status: "draft" | "active" | "completed";
  pieces: LearningPiece[];
}

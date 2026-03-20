export interface EvaluationResult {
  score: number;
  feedback: string;
  misconceptions: string[];
  strengths: string[];
  triggeredRegen: boolean;
}

export interface ExerciseSubmission {
  exerciseId: string;
  answer: string;
}

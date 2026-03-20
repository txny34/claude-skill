import { z } from "zod";

export const SocraticTurnRequestSchema = z.object({
  topicId: z.string().min(1),
  sessionId: z.string().optional(),
  userMessage: z.string().min(1),
});

export type SocraticTurnRequest = z.infer<typeof SocraticTurnRequestSchema>;

export const SocraticTurnResponseSchema = z.object({
  assistantMessage: z.string(),
  questionNumber: z.number().int().min(0),
  isComplete: z.boolean(),
});

export type SocraticTurnResponse = z.infer<typeof SocraticTurnResponseSchema>;

export const QuizQuestionSchema = z
  .object({
    question: z.string().min(1),
    options: z.array(z.string()).min(2),
    correctIndex: z.number().int().min(0),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  })
  .refine((q) => q.correctIndex < q.options.length, {
    message: "correctIndex must be within options range",
  });

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizGenerationResponseSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(1),
});

export type QuizGenerationResponse = z.infer<
  typeof QuizGenerationResponseSchema
>;

export const KnowledgeProfileOutputSchema = z.object({
  level: z.enum(["beginner", "intermediate", "advanced"]),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  misconceptions: z.array(z.string()),
  rawAssessment: z.string().min(1),
});

export type KnowledgeProfileOutput = z.infer<
  typeof KnowledgeProfileOutputSchema
>;

export const DiagnosticCompleteRequestSchema = z.object({
  sessionId: z.string().min(1),
  topicId: z.string().min(1),
  answers: z.array(z.number().int().min(0)).optional(),
});

export type DiagnosticCompleteRequest = z.infer<
  typeof DiagnosticCompleteRequestSchema
>;

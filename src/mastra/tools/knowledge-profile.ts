import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createProfile } from "@/features/learning/lib/knowledge-profile-repository";
import { recordUsage } from "@/shared/lib/rate-limiter";

export const saveKnowledgeProfileTool = createTool({
  id: "save-knowledge-profile",
  description:
    "Persists the user's knowledge profile after diagnostic assessment. Call this when you have gathered enough information to assess the user's level, strengths, weaknesses, and misconceptions.",
  inputSchema: z.object({
    topicId: z.string().describe("The topic ID being diagnosed"),
    level: z
      .enum(["beginner", "intermediate", "advanced"])
      .describe("The user's assessed knowledge level"),
    strengths: z
      .array(z.string())
      .describe("Areas where the user demonstrates strong understanding"),
    weaknesses: z
      .array(z.string())
      .describe("Areas where the user needs improvement"),
    misconceptions: z
      .array(z.string())
      .describe("Incorrect beliefs or misunderstandings the user holds"),
    rawAssessment: z
      .string()
      .describe("Full text assessment of the user's knowledge"),
  }),
  execute: async ({ context }) => {
    const profile = await createProfile(context.topicId, {
      level: context.level,
      strengths: context.strengths,
      weaknesses: context.weaknesses,
      misconceptions: context.misconceptions,
      rawAssessment: context.rawAssessment,
    });

    await recordUsage("diagnostic", 0);

    return { saved: true, profile };
  },
});

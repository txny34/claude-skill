import { prisma } from "@/shared/lib/db-client";
import type { KnowledgeProfileOutput } from "@/features/learning/lib/schemas";
import type { KnowledgeProfile } from "@/features/learning/types/diagnostic";

interface DbProfile {
  id: string;
  topicId: string;
  level: string;
  strengths: string;
  weaknesses: string;
  misconceptions: string;
  rawAssessment: string;
}

function toDomain(row: DbProfile): KnowledgeProfile {
  return {
    level: row.level as KnowledgeProfile["level"],
    strengths: JSON.parse(row.strengths) as string[],
    weaknesses: JSON.parse(row.weaknesses) as string[],
    misconceptions: JSON.parse(row.misconceptions) as string[],
    rawAssessment: row.rawAssessment,
  };
}

export async function createProfile(
  topicId: string,
  profile: KnowledgeProfileOutput
): Promise<KnowledgeProfile> {
  const row = await prisma.knowledgeProfile.create({
    data: {
      topicId,
      level: profile.level,
      strengths: JSON.stringify(profile.strengths),
      weaknesses: JSON.stringify(profile.weaknesses),
      misconceptions: JSON.stringify(profile.misconceptions),
      rawAssessment: profile.rawAssessment,
    },
  });
  return toDomain(row);
}

export async function getProfileByTopicId(
  topicId: string
): Promise<KnowledgeProfile | null> {
  const row = await prisma.knowledgeProfile.findUnique({
    where: { topicId },
  });
  return row ? toDomain(row) : null;
}

export async function hasProfile(topicId: string): Promise<boolean> {
  const row = await prisma.knowledgeProfile.findUnique({
    where: { topicId },
  });
  return row !== null;
}

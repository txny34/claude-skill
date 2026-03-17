import { prisma } from "@/lib/db/client";

const DEFAULT_LIMITS: Record<string, number> = {
  diagnostic: Number(process.env.DAILY_DIAGNOSTIC_LIMIT ?? 10),
  "content-generator": Number(process.env.DAILY_CONTENT_LIMIT ?? 50),
  evaluator: Number(process.env.DAILY_EVALUATION_LIMIT ?? 100),
  "jsx-generator": Number(process.env.DAILY_JSX_GENERATION_LIMIT ?? 5),
};

function getStartOfDay(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export async function checkRateLimit(agentName: string): Promise<{
  allowed: boolean;
  remaining: number;
  limit: number;
}> {
  const limit = DEFAULT_LIMITS[agentName] ?? 50;
  const startOfDay = getStartOfDay();

  const count = await prisma.rateLimitLog.count({
    where: {
      agentName,
      createdAt: { gte: startOfDay },
    },
  });

  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count),
    limit,
  };
}

export async function recordUsage(
  agentName: string,
  tokensUsed: number,
  costEstimate: number = 0
): Promise<void> {
  await prisma.rateLimitLog.create({
    data: {
      agentName,
      tokensUsed,
      costEstimate,
    },
  });
}

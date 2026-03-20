import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/db-client";
import { getProfileByTopicId } from "@/features/learning/lib/knowledge-profile-repository";
import { DiagnosticFlow } from "@/features/learning/components/DiagnosticFlow";
import { KnowledgeProfileCard } from "@/features/learning/components/KnowledgeProfileCard";

interface DiagnosticPageProps {
  params: Promise<{ topicId: string }>;
}

export default async function DiagnosticPage({ params }: DiagnosticPageProps) {
  const { topicId } = await params;

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!topic) {
    redirect("/");
  }

  const existingProfile = await getProfileByTopicId(topicId);

  if (existingProfile) {
    return (
      <KnowledgeProfileCard
        profile={existingProfile}
        topicTitle={topic.title}
      />
    );
  }

  return <DiagnosticFlow topicId={topicId} topicTitle={topic.title} />;
}

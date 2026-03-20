import { prisma } from "@/shared/lib/db-client";
import { Sidebar } from "@/shared/components/Sidebar";

export async function AppSidebar() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return <Sidebar topics={topics} />;
}

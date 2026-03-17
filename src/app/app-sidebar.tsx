import { prisma } from "@/lib/db/client";
import { Sidebar } from "@/components/layout/Sidebar";

export async function AppSidebar() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return <Sidebar topics={topics} />;
}

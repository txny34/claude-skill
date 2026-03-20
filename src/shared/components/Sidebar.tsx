"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/ui/scroll-area";
import { Separator } from "@/ui/separator";
import { cn } from "@/shared/lib/utils";

interface TopicLink {
  id: string;
  title: string;
}

interface SidebarProps {
  topics: TopicLink[];
}

export function Sidebar({ topics }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r">
      <div className="p-4">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          + Nuevo tema
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-4">
        <nav className="flex flex-col gap-1">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/learn/${topic.id}`}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                pathname?.includes(topic.id) && "bg-accent font-medium"
              )}
            >
              {topic.title}
            </Link>
          ))}
          {topics.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No hay temas todavia
            </p>
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
}

"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <h1 className="text-lg font-semibold">SkillForge</h1>
      {session?.user && (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image ?? undefined} />
            <AvatarFallback>
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            Salir
          </Button>
        </div>
      )}
    </header>
  );
}

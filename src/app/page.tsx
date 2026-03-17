"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      const data = await res.json();
      router.push(`/learn/${data.id}/diagnostic`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Que queres aprender?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              placeholder="ej: React Server Components, Docker, GraphQL..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={!topic.trim() || loading}>
              {loading ? "Creando..." : "Empezar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

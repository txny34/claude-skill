import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/db-client";

export async function POST(request: Request) {
  const { title } = await request.json();

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const topic = await prisma.topic.create({
    data: { title: title.trim() },
  });

  return NextResponse.json({ id: topic.id });
}

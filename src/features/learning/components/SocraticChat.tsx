"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Card } from "@/ui/card";
import { useDiagnosticStream } from "@/features/learning/hooks/use-diagnostic-stream";
import type { DiagnosticMessage } from "@/features/learning/types/diagnostic";
import type { KnowledgeProfile } from "@/features/learning/types/diagnostic";

interface SocraticChatProps {
  topicId: string;
  topicTitle: string;
  onComplete: (profile: KnowledgeProfile) => void;
}

export function SocraticChat({
  topicId,
  topicTitle,
  onComplete,
}: SocraticChatProps) {
  const [messages, setMessages] = useState<DiagnosticMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isStreaming, error, sendMessage } = useDiagnosticStream();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: DiagnosticMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const response = await sendMessage("/api/diagnostic", {
      topicId,
      sessionId,
      userMessage: trimmed,
    });

    if (response) {
      // Try to parse the streamed response for structured data
      // The Mastra stream may include text chunks - extract the assistant message
      const assistantMessage: DiagnosticMessage = {
        role: "assistant",
        content: extractTextFromStream(response),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setQuestionCount((prev) => prev + 1);

      // Check for session ID in response
      const newSessionId = extractSessionId(response);
      if (newSessionId) {
        setSessionId(newSessionId);
      }
    }
  }

  async function handleComplete() {
    if (!sessionId || isCompleting) return;
    setIsCompleting(true);

    try {
      const res = await fetch("/api/diagnostic/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, topicId }),
      });

      if (res.ok) {
        const data = await res.json();
        onComplete(data.profile);
      }
    } finally {
      setIsCompleting(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="text-center text-sm text-muted-foreground">
        Diagnostico Socratico: {topicTitle}
        {questionCount > 0 && ` — Pregunta ${questionCount}`}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border p-4">
        {messages.length === 0 && !isStreaming && (
          <p className="text-center text-sm text-muted-foreground">
            Escribi lo que sabes sobre {topicTitle} para empezar el diagnostico.
          </p>
        )}

        {messages.map((msg, i) => (
          <Card
            key={i}
            className={`max-w-[80%] p-3 ${
              msg.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "mr-auto"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
          </Card>
        ))}

        {isStreaming && (
          <Card className="mr-auto max-w-[80%] p-3">
            <p className="text-sm animate-pulse">Pensando...</p>
          </Card>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tu respuesta..."
          disabled={isStreaming || isCompleting}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming || isCompleting}
        >
          Enviar
        </Button>
        {questionCount >= 3 && (
          <Button
            variant="outline"
            onClick={handleComplete}
            disabled={isStreaming || isCompleting}
          >
            {isCompleting ? "Evaluando..." : "Finalizar"}
          </Button>
        )}
      </div>
    </div>
  );
}

function extractTextFromStream(raw: string): string {
  // Mastra data stream format: lines starting with "0:" contain text chunks
  const lines = raw.split("\n");
  const textChunks: string[] = [];

  for (const line of lines) {
    if (line.startsWith("0:")) {
      try {
        const content = JSON.parse(line.slice(2));
        if (typeof content === "string") {
          textChunks.push(content);
        }
      } catch {
        // Skip unparseable lines
      }
    }
  }

  return textChunks.join("") || raw;
}

function extractSessionId(raw: string): string | null {
  // Session ID comes via response header, handled by the hook
  // This is a fallback in case it's embedded in the stream
  return null;
}

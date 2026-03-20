"use client";

import { useState, useEffect } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { useDiagnosticStream } from "@/features/learning/hooks/use-diagnostic-stream";
import type { KnowledgeProfile } from "@/features/learning/types/diagnostic";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface QuizModeProps {
  topicId: string;
  topicTitle: string;
  onComplete: (profile: KnowledgeProfile) => void;
}

export function QuizMode({ topicId, topicTitle, onComplete }: QuizModeProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { isStreaming, error, sendMessage } = useDiagnosticStream();

  useEffect(() => {
    generateQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateQuiz() {
    const response = await sendMessage("/api/diagnostic/quiz", {
      topicId,
      topicTitle,
    });

    if (response) {
      const parsed = parseQuizFromStream(response);
      if (parsed.length > 0) {
        setQuestions(parsed);
      }

      // Extract session ID from hook state
    }
  }

  function selectAnswer(questionIndex: number, optionIndex: number) {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const answerArray = questions.map((_, i) => answers[i] ?? -1);
      const res = await fetch("/api/diagnostic/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          topicId,
          answers: answerArray,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onComplete(data.profile);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const allAnswered = questions.length > 0 &&
    questions.every((_, i) => answers[i] !== undefined);
  const currentQuestion = questions[currentIndex];

  if (isStreaming || questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="animate-pulse text-muted-foreground">
          Generando quiz sobre {topicTitle}...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Quiz: {topicTitle}</h2>
        <Badge variant="outline">
          {currentIndex + 1} / {questions.length}
        </Badge>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                currentQuestion.difficulty === "beginner"
                  ? "secondary"
                  : currentQuestion.difficulty === "intermediate"
                  ? "default"
                  : "destructive"
              }
            >
              {currentQuestion.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-base">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {currentQuestion.options.map((option, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(currentIndex, i)}
              className={`w-full rounded-md border p-3 text-left text-sm transition-colors ${
                answers[currentIndex] === i
                  ? "border-primary bg-primary/10"
                  : "hover:bg-muted"
              }`}
            >
              {option}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          disabled={currentIndex === 0}
        >
          Anterior
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            disabled={answers[currentIndex] === undefined}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
          >
            {isSubmitting ? "Evaluando..." : "Enviar respuestas"}
          </Button>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === currentIndex
                ? "bg-primary"
                : answers[i] !== undefined
                ? "bg-primary/40"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function parseQuizFromStream(raw: string): QuizQuestion[] {
  // Try to extract JSON from Mastra data stream
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
        // Skip
      }
    }
  }

  const fullText = textChunks.join("");

  // Try to find JSON in the text
  const jsonMatch = fullText.match(/\{[\s\S]*"questions"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.questions)) {
        return parsed.questions;
      }
    } catch {
      // Try parsing the array directly
    }
  }

  // Try parsing the full text as JSON
  try {
    const parsed = JSON.parse(fullText);
    if (Array.isArray(parsed.questions)) {
      return parsed.questions;
    }
  } catch {
    // Could not parse
  }

  return [];
}

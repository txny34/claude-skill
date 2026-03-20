"use client";

import { useState } from "react";
import { ModeSelector } from "./ModeSelector";
import { SocraticChat } from "./SocraticChat";
import { QuizMode } from "./QuizMode";
import { KnowledgeProfileCard } from "./KnowledgeProfileCard";
import type { DiagnosticMode, KnowledgeProfile } from "@/features/learning/types/diagnostic";

type Stage = "select" | "socratic" | "quiz" | "results";

interface DiagnosticFlowProps {
  topicId: string;
  topicTitle: string;
}

export function DiagnosticFlow({ topicId, topicTitle }: DiagnosticFlowProps) {
  const [stage, setStage] = useState<Stage>("select");
  const [profile, setProfile] = useState<KnowledgeProfile | null>(null);

  function handleModeSelect(mode: DiagnosticMode) {
    setStage(mode);
  }

  function handleComplete(result: KnowledgeProfile) {
    setProfile(result);
    setStage("results");
  }

  switch (stage) {
    case "select":
      return <ModeSelector onSelect={handleModeSelect} />;

    case "socratic":
      return (
        <SocraticChat
          topicId={topicId}
          topicTitle={topicTitle}
          onComplete={handleComplete}
        />
      );

    case "quiz":
      return (
        <QuizMode
          topicId={topicId}
          topicTitle={topicTitle}
          onComplete={handleComplete}
        />
      );

    case "results":
      return profile ? (
        <KnowledgeProfileCard profile={profile} topicTitle={topicTitle} />
      ) : null;
  }
}

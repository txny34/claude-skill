"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import type { KnowledgeProfile } from "@/features/learning/types/diagnostic";

interface KnowledgeProfileCardProps {
  profile: KnowledgeProfile;
  topicTitle: string;
}

const LEVEL_CONFIG = {
  beginner: { label: "Principiante", variant: "secondary" as const },
  intermediate: { label: "Intermedio", variant: "default" as const },
  advanced: { label: "Avanzado", variant: "destructive" as const },
};

export function KnowledgeProfileCard({
  profile,
  topicTitle,
}: KnowledgeProfileCardProps) {
  const levelConfig = LEVEL_CONFIG[profile.level];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Tu perfil: {topicTitle}</h2>
        <Badge variant={levelConfig.variant} className="mt-2">
          {levelConfig.label}
        </Badge>
      </div>

      {profile.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-green-600">
              Fortalezas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {profile.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {profile.weaknesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-orange-600">
              Areas a mejorar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {profile.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-500">!</span>
                  {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {profile.misconceptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-600">
              Conceptos a corregir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {profile.misconceptions.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-red-500">x</span>
                  {m}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {profile.rawAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evaluacion detallada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {profile.rawAssessment}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="text-center pt-4">
        <Button disabled>
          Generar plan de aprendizaje (Phase 3)
        </Button>
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import type { DiagnosticMode } from "@/features/learning/types/diagnostic";

interface ModeSelectorProps {
  onSelect: (mode: DiagnosticMode) => void;
}

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold">
        Como queres que te diagnostique?
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card
          className="cursor-pointer transition-colors hover:border-primary"
          onClick={() => onSelect("socratic")}
        >
          <CardHeader>
            <CardTitle className="text-lg">Entrevista Socratica</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Conversacion guiada con 6-8 preguntas abiertas. Ideal para una
              evaluacion profunda de tu nivel.
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-colors hover:border-primary"
          onClick={() => onSelect("quiz")}
        >
          <CardHeader>
            <CardTitle className="text-lg">Quiz Rapido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              8-10 preguntas multiple choice con dificultad graduada. Mas rapido
              y directo.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

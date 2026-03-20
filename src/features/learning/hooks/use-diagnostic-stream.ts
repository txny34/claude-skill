"use client";

import { useState, useCallback } from "react";

interface StreamState {
  data: string;
  isStreaming: boolean;
  error: string | null;
  sessionId: string | null;
}

export function useDiagnosticStream() {
  const [state, setState] = useState<StreamState>({
    data: "",
    isStreaming: false,
    error: null,
    sessionId: null,
  });

  const sendMessage = useCallback(
    async (url: string, body: Record<string, unknown>) => {
      setState((prev) => ({
        ...prev,
        data: "",
        isStreaming: true,
        error: null,
      }));

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage =
            errorData?.error ?? `Request failed with status ${response.status}`;
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            error: errorMessage,
          }));
          return null;
        }

        const newSessionId = response.headers.get("X-Session-Id");
        if (newSessionId) {
          setState((prev) => ({ ...prev, sessionId: newSessionId }));
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            error: "No response body",
          }));
          return null;
        }

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setState((prev) => ({
            ...prev,
            data: accumulated,
          }));
        }

        setState((prev) => ({ ...prev, isStreaming: false }));
        return accumulated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: message,
        }));
        return null;
      }
    },
    []
  );

  return {
    ...state,
    sendMessage,
  };
}

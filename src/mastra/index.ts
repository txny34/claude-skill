import { Mastra } from "@mastra/core";
import { diagnosticAgent } from "./agents/diagnostic";

export const mastra = new Mastra({
  agents: { diagnosticAgent },
});

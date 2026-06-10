// Bridge: shared agentic kit → ai-admin ToolsTable rows. Surfaces every tool
// registered on a ToolHost (e.g. the assistant's createToolRegistry()) as
// AITool rows so operators see the live cross-slice tool surface in the
// admin console — the registry IS the source of truth, no manual catalog.

import type { ToolHost } from "@/shared/agentic";
import type { AITool } from "./types";

export function toolRegistryRows(host: ToolHost): AITool[] {
  return host.anthropicTools().map((t) => ({
    slug: t.name,
    name: t.name,
    description: t.description,
    jsonSchema: t.input_schema as unknown as Record<string, unknown>,
    impl: "local",
    sandboxed: false,
  }));
}

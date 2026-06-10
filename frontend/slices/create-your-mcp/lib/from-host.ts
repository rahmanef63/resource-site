// Bridge: shared agentic kit → MCP ToolDef[]. Any ToolHost (e.g. a
// createToolRegistry() aggregating many slices' tool collections) becomes a
// ready-to-serve MCP tool array for the JSON-RPC dispatcher:
//
//   const TOOLS = toolDefsFromHost(registry);
//   dispatchJsonRpc(req, TOOLS, scope);
//
// Dots in qualified names (`image-editor.layer.add`) are mapped to
// underscores for MCP-client compatibility; invocation still dispatches to
// the original qualified name on the host.

import type { ToolHost } from "@/shared/agentic";
import type { ToolDef } from "./types";

export function toolDefsFromHost(host: ToolHost): ToolDef[] {
  return host.anthropicTools().map((t): ToolDef => {
    const qualified = t.name;
    return {
      name: qualified.replace(/\./g, "_"),
      description: t.description,
      inputSchema: t.input_schema as unknown as Record<string, unknown>,
      handler: async (args) => {
        const outcome = await host.invoke(qualified, args);
        return {
          content: [{ type: "text", text: outcome.result }],
          isError: !outcome.ok,
        };
      },
    };
  });
}

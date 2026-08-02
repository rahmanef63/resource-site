// Example MCP tool — replace with your real tools. Each tool exports a
// `ToolDef` and gets wired into the route's tool array. Annotate with
// `readOnlyHint`/`destructiveHint` so AI clients render the right UX.

import type { ToolDef } from "../types";

export const exampleTool: ToolDef = {
  name: "ping",
  description: "Returns 'pong' — sanity check that the MCP wire is up.",
  inputSchema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, idempotentHint: true },
  requiredScope: undefined,
  handler: async () => ({
    content: [{ type: "text", text: "pong" }],
  }),
};

export const exampleTools: ToolDef[] = [exampleTool];

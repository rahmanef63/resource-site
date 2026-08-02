import { defineToolCollection, type ToolCollection } from "@/shared/agentic";
import type { AnthropicTool, EditorCommand, EditorCtx } from "./types";
import { describeDoc } from "./schema";
import { layerCommands } from "./layer.commands";
import { adjustCommands } from "./adjust.commands";
import { styleCommands } from "./style.commands";
import { transformCommands } from "./transform.commands";
import { documentCommands } from "./document.commands";
import { toolCommands } from "./tool.commands";
import { exportCommands } from "./export.commands";

// The single source of truth for every AI-callable editor operation. Add a
// command = append to its domain file; it flows into the tools schema + invoke
// with no other wiring. Adding a domain = import + spread it here.
export const EDITOR_COMMANDS: EditorCommand[] = [
  ...documentCommands,
  ...layerCommands,
  ...transformCommands,
  ...toolCommands,
  ...adjustCommands,
  ...styleCommands,
  ...exportCommands,
];

const BY_NAME = new Map(EDITOR_COMMANDS.map((c) => [c.name, c]));

export function findCommand(name: string): EditorCommand | undefined {
  return BY_NAME.get(name);
}

// Anthropic `tools` array derived from the registry (sent to /api/assistant).
export const EDITOR_TOOLS: AnthropicTool[] = EDITOR_COMMANDS.map((c) => ({
  name: c.name,
  description: c.description,
  input_schema: c.parameters,
}));

// The slice's agent-agnostic tool collection. A central host registers this
// alongside other slices' collections so ONE agent can drive them all:
//   registry.register(imageEditorTools, () => editorStore)
// Tool names are namespaced to "image-editor.<name>" on register.
export const imageEditorTools: ToolCollection<EditorCtx> = defineToolCollection<EditorCtx>({
  namespace: "image-editor",
  tools: EDITOR_COMMANDS,
  describe: (ctx) => describeDoc(ctx),
  instructions:
    "Edits a layered raster document. Add/select a layer before painting, transforming, or " +
    "styling it; read the document read-back for layer ids and the active selection. Prefer " +
    "non-destructive ops (layer styles, transforms) over flatten/export until the user asks.",
});

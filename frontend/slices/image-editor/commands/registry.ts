import type { AnthropicTool, EditorCommand, EditorCtx, EditorToolCollection } from "./types";
import { describeDoc } from "./schema";
import { layerCommands } from "./layer.commands";
import { adjustCommands } from "./adjust.commands";
import { styleCommands } from "./style.commands";
import { transformCommands } from "./transform.commands";
import { documentCommands } from "./document.commands";
import { toolCommands } from "./tool.commands";
import { exportCommands } from "./export.commands";

export const EDITOR_COMMANDS: EditorCommand[] = [
  ...documentCommands,
  ...layerCommands,
  ...transformCommands,
  ...toolCommands,
  ...adjustCommands,
  ...styleCommands,
  ...exportCommands,
];

const BY_NAME = new Map(EDITOR_COMMANDS.map((command) => [command.name, command]));

export function findCommand(name: string): EditorCommand | undefined {
  return BY_NAME.get(name);
}

export const EDITOR_TOOLS: AnthropicTool[] = EDITOR_COMMANDS.map((command) => ({
  name: command.name,
  description: command.description,
  input_schema: command.parameters,
}));

export const imageEditorTools: EditorToolCollection = {
  namespace: "image-editor",
  tools: EDITOR_COMMANDS,
  describe: (ctx: EditorCtx) => describeDoc(ctx),
  instructions:
    "Edits a layered raster document. Add/select a layer before painting, transforming, or " +
    "styling it; read the document read-back for layer ids and the active selection. Prefer " +
    "non-destructive ops (layer styles, transforms) over flatten/export until the user asks.",
};

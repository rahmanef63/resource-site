import type { AnthropicTool, EditorCtx } from "../commands/types";
import type { ToolInvocation, ToolOutcome } from "../commands/invoke";

export type ImageEditorMessage = { role: "user" | "assistant"; text: string };
export type ImageEditorAssistantRequest = {
  messages: ImageEditorMessage[];
  tools: AnthropicTool[];
  readback: string;
  invoke: (call: ToolInvocation) => Promise<ToolOutcome>;
  ctx: EditorCtx;
};
export type ImageEditorAssistantRunner = (request: ImageEditorAssistantRequest) => Promise<string>;

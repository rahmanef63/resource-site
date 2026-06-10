// Integration seam between this slice and the host app. The AI streaming
// bridge is now the SHARED agentic seam (`@/shared/agentic`) so every agentic
// slice wires its model in ONE place — call `configureAgentStream(fn)` at app
// startup (an SSE route, the Vercel AI SDK, the Anthropic SDK…). Without
// wiring, the in-editor AI chat surfaces a friendly "not configured" error;
// every other editor feature works untouched.
//
// These re-exports preserve the editor's local type names (`AiTool`,
// `AiToolUse`) over the shared shapes so existing imports keep working.

export {
  configureAgentStream,
  isAgentStreamConfigured,
  streamAgentTurn,
  type AgentStreamFn,
} from "@/shared/agentic";
export type {
  AnthropicTool as AiTool,
  ToolUse as AiToolUse,
  AgentMsg,
  AgentTurn,
} from "@/shared/agentic";

// Hidden-input file picker primitive (audit:templates forbids raw native file
// inputs in slice source — the picker owns it outside the slice).
export { FilePicker } from "@/shared/ui/FilePicker";
export type { FilePickerHandle } from "@/shared/ui/FilePicker";

// Single integration seam between this slice and the host app: the AI
// streaming bridge is the ONLY host service the editor uses (everything else
// is props + shadcn primitives). In the rr catalog build the bridge is
// INJECTABLE — call `configureAgentStream(fn)` at app startup to wire your
// backend (an SSE route, the Vercel AI SDK, claude-api…). Without wiring,
// the in-editor AI chat surfaces a friendly "not configured" error; every
// other editor feature works untouched.

export type AiTool = { name: string; description: string; input_schema: Record<string, unknown> };
export type AiToolUse = { id: string; name: string; input: Record<string, unknown> };
export type AgentMsg =
  | { role: "user"; text: string }
  | { role: "assistant"; text?: string; toolUses?: AiToolUse[] }
  | { role: "tool"; results: { id: string; content: string; isError?: boolean }[] };
export type AgentTurn = { text: string; toolUses: AiToolUse[]; stopReason: string | null };

export type AgentStreamFn = (
  messages: AgentMsg[],
  tools: AiTool[],
  onDelta: (chunk: string) => void,
) => Promise<AgentTurn>;

let impl: AgentStreamFn = async () => {
  throw new Error(
    "AI bridge not configured — call configureAgentStream(fn) from @/features/image-editor to wire your backend.",
  );
};

/** Host wiring: provide the one-turn agent stream implementation. */
export function configureAgentStream(fn: AgentStreamFn): void {
  impl = fn;
}

export const streamAgentTurn: AgentStreamFn = (messages, tools, onDelta) =>
  impl(messages, tools, onDelta);

// Hidden-input file picker primitive (audit:templates forbids raw
// native file inputs in slice source — the picker owns it outside the slice).
export { FilePicker } from "@/shared/ui/FilePicker";
export type { FilePickerHandle } from "@/shared/ui/FilePicker";

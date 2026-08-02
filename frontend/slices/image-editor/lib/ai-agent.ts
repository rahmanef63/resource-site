import { runAgentLoop, type AgentMsg, type AnthropicTool, type ToolHost } from "@/shared/agentic";
import type { ToolInvocation, ToolOutcome } from "../commands/use-editor-commands";

export type AgentEvents = {
  /** Streaming text deltas for the current assistant turn. */
  onDelta: (chunk: string) => void;
  /** A tool the model called, with the local execution outcome. */
  onTool: (name: string, input: Record<string, unknown>, outcome: ToolOutcome) => void;
};

// Back-compat wrapper over the SHARED agent loop. The editor's in-editor chat
// is just one consumer of the one loop: it adapts its store-bound
// {tools, invoke} (from useEditorCommands) into a ToolHost and delegates. The
// editor no longer owns a private function-calling loop.
export function runEditorAgent(
  history: AgentMsg[],
  tools: AnthropicTool[],
  invoke: (call: ToolInvocation) => Promise<ToolOutcome>,
  ev: AgentEvents,
  maxTurns = 8,
): Promise<{ history: AgentMsg[]; text: string }> {
  const host: ToolHost = {
    anthropicTools: () => tools,
    invoke: (name, input) => invoke({ name, input }),
  };
  return runAgentLoop(history, host, { onDelta: ev.onDelta, onTool: ev.onTool }, maxTurns);
}

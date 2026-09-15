import { runAgentLoop } from "@/shared/agentic/agent-loop";
import { isAgentStreamConfigured } from "@/shared/agentic/host";
import type { AgentMsg } from "@/shared/agentic/types";
import { getAssistantRegistry } from "./agentic-host";
import { streamReply, type WireMsg } from "./stream-core";
import { toolById } from "./tools";
import type { Agent, Automation, ChatMessage } from "./types";

export const ASSISTANT_SUGGESTED = [
  "Show system stats",
  "List /home",
  "Restart a service",
] as const;

let seq = 0;
export const nextChatId = () => `m${Date.now()}-${seq++}`;

export function assistantErrorText(error: unknown): string {
  const code = error instanceof Error ? error.message : "";
  if (code === "no_api_key") {
    return "No Anthropic API key set. Add one in Settings → AI, or set ANTHROPIC_API_KEY on the server.";
  }
  if (code === "unauthorized") return "Session expired — sign in again.";
  return "Couldn't reach the assistant. Try again.";
}

export function buildWireMessages(
  agent: Agent,
  messages: readonly ChatMessage[],
  text: string,
): WireMsg[] {
  const wire: WireMsg[] = [];
  if (agent.persona.trim()) {
    wire.push({ role: "user", text: `[System — you are ${agent.name}] ${agent.persona}` });
  }
  wire.push(
    ...messages.map((message) => ({ role: message.role, text: message.text })),
    { role: "user", text },
  );
  return wire;
}

export async function runAssistantTurn(
  agent: Agent,
  messages: readonly ChatMessage[],
  text: string,
  events: {
    onDelta: (chunk: string) => void;
    onTool?: (name: string, outcome: { ok: boolean; result: string }) => void;
  },
): Promise<void> {
  const wire = buildWireMessages(agent, messages, text);
  if (isAgentStreamConfigured()) {
    const history: AgentMsg[] = wire.map((message) => ({ role: message.role, text: message.text }));
    await runAgentLoop(history, getAssistantRegistry(), {
      onDelta: events.onDelta,
      onTool: (name, _input, outcome) => {
        events.onTool?.(name, outcome);
        events.onDelta(`\n\n⚙ ${name} ${outcome.ok ? "✓" : "✗"} ${outcome.result.slice(0, 200)}\n\n`);
      },
    });
    return;
  }
  for await (const token of streamReply(wire)) events.onDelta(token);
}

export function automationPrompt(auto: Automation): string {
  const lines = auto.steps.map((step, index) => {
    const tool = toolById(step.tool);
    return `  ${index + 1}. ${tool?.name ?? step.tool}${step.argText ? ` — ${step.argText}` : ""}`;
  });
  return `Run the automation “${auto.name}” by calling these tools in order, one at a time:\n${lines.join("\n") || "  (no steps)"}`;
}

export function automationDemoMessage(auto: Automation, agent: Agent): string {
  const lines = auto.steps.map((step, index) => {
    const tool = toolById(step.tool);
    return `  ${index + 1}. ${tool?.name ?? step.tool}${step.argText ? ` — ${step.argText}` : ""}`;
  });
  return `Running automation “${auto.name}” as ${agent.name}:\n${lines.join("\n") || "  (no steps)"}\n\n(Steps logged — no real execution in this build.)`;
}

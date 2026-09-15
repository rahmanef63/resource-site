import {
  configureAgentStream,
  isAgentStreamConfigured,
  type AgentStreamFn,
} from "@/shared/agentic/host";

export { configureAgentStream, isAgentStreamConfigured };
export type { AgentStreamFn };

export type WireMsg = { role: "user" | "assistant"; text: string };
export type AssistantStreamFn = (messages: WireMsg[]) => AsyncIterable<string>;

/** Offline demo stream: types out a canned reply so the UI works unwired. */
async function* demoStream(messages: WireMsg[]): AsyncIterable<string> {
  const last = messages[messages.length - 1]?.text ?? "";
  const reply =
    `Demo mode — no model is wired yet. You said: “${last.slice(0, 120)}”. ` +
    "Connect a real LLM with configureAgentStream(fn) from the shared agentic host " +
    "(function calling) or configureAssistantStream(fn) (text-only).";
  for (const word of reply.split(/(?<= )/)) {
    await new Promise((resolve) => setTimeout(resolve, 24));
    yield word;
  }
}

/** Back-compatible text-only adapter funnelled into the shared model seam. */
export function configureAssistantStream(fn: AssistantStreamFn): void {
  configureAgentStream(async (messages, _tools, onDelta) => {
    const wire: WireMsg[] = [];
    for (const message of messages) {
      if (message.role === "user") wire.push({ role: "user", text: message.text });
      else if (message.role === "assistant" && message.text) {
        wire.push({ role: "assistant", text: message.text });
      }
    }
    let text = "";
    for await (const delta of fn(wire)) {
      text += delta;
      onDelta(delta);
    }
    return { text, toolUses: [], stopReason: "end_turn" };
  });
}

export function streamReply(messages: WireMsg[]): AsyncIterable<string> {
  return demoStream(messages);
}

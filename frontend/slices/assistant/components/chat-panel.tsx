"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  isAgentStreamConfigured,
  runAgentLoop,
  type AgentMsg,
} from "@/shared/agentic";
import { getAssistantRegistry } from "../lib/agentic-host";
import { streamReply, type WireMsg } from "../lib/host";
import { toolById } from "../lib/tools";
import type { Agent, Automation } from "../lib/types";
import { MessageBubble, type ChatMessage } from "./message-bubble";
import { ChatComposer } from "./chat-composer";
import { EmptyState } from "./empty-state";

const SUGGESTED = ["Show system stats", "List /home", "Restart a service"];

function errText(err: unknown): string {
  const code = err instanceof Error ? err.message : "";
  if (code === "no_api_key")
    return "No Anthropic API key set. Add one in Settings → AI, or set ANTHROPIC_API_KEY on the server.";
  if (code === "unauthorized") return "Session expired — sign in again.";
  return "Couldn't reach the assistant. Try again.";
}

let seq = 0;
const nextId = () => `m${Date.now()}-${seq++}`;

export type ChatHandle = { runSteps: (auto: Automation, agent?: Agent) => void };

// The REAL streaming chat. With the shared model seam configured it runs the
// shared function-calling loop against the assistant registry (every slice
// collection registered via registerAssistantTools); unwired it falls back to
// the typing demo. The active agent's persona is prepended as a leading
// system-style turn so replies adopt the selected agent's voice.
export const ChatPanel = forwardRef<
  ChatHandle,
  { agent: Agent; onSwitchAgent: () => void; switcher: React.ReactNode }
>(function ChatPanel({ agent, switcher }, ref) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef(agent);
  agentRef.current = agent;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      if (streaming) return;
      const a = agentRef.current;
      const userMsg: ChatMessage = { id: nextId(), role: "user", text };
      const replyId = nextId();
      // Persona is sent as a leading system-style user line; the rest is the
      // real turn history. Same WireMsg[] shape streamReply already accepts.
      const wire: WireMsg[] = [];
      if (a.persona.trim())
        wire.push({ role: "user", text: `[System — you are ${a.name}] ${a.persona}` });
      wire.push(
        ...messages.map((m) => ({ role: m.role, text: m.text })),
        { role: "user", text },
      );
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: replyId, role: "assistant", text: "" },
      ]);
      setStreaming(true);
      const append = (chunk: string) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === replyId ? { ...m, text: m.text + chunk } : m)),
        );
      try {
        if (isAgentStreamConfigured()) {
          // Real function-calling loop over every registered slice collection.
          const history: AgentMsg[] = wire.map((w) => ({ role: w.role, text: w.text }));
          await runAgentLoop(history, getAssistantRegistry(), {
            onDelta: append,
            onTool: (name, _input, outcome) =>
              append(`\n\n⚙ ${name} ${outcome.ok ? "✓" : "✗"} ${outcome.result.slice(0, 200)}\n\n`),
          });
        } else {
          for await (const token of streamReply(wire)) append(token);
        }
      } catch (err) {
        const note = errText(err);
        setMessages((prev) =>
          prev.map((m) => (m.id === replyId ? { ...m, text: note } : m)),
        );
      } finally {
        setStreaming(false);
      }
    },
    [streaming, messages],
  );

  // Automations: with the model seam configured the steps become a real
  // function-calling task; unwired they narrate into the thread as before.
  useImperativeHandle(ref, () => ({
    runSteps(auto, runAgent) {
      const lines = auto.steps.map((s, i) => {
        const t = toolById(s.tool);
        return `  ${i + 1}. ${t?.name ?? s.tool}${s.argText ? ` — ${s.argText}` : ""}`;
      });
      if (isAgentStreamConfigured()) {
        void send(
          `Run the automation “${auto.name}” by calling these tools in order, ` +
            `one at a time:\n${lines.join("\n") || "  (no steps)"}`,
        );
        return;
      }
      const body =
        `Running automation “${auto.name}” as ${(runAgent ?? agentRef.current).name}:\n` +
        (lines.join("\n") || "  (no steps)") +
        "\n\n(Steps logged — no real execution in this build.)";
      setMessages((prev) => [...prev, { id: nextId(), role: "assistant", text: body }]);
    },
  }));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-card/40 px-3 py-2 [scrollbar-width:none]">
        {switcher}
      </div>
      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto">
          <EmptyState prompts={SUGGESTED} onPick={send} />
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      )}
      <ChatComposer onSend={send} streaming={streaming} />
    </div>
  );
});

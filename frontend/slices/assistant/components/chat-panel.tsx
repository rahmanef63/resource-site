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
import type { Agent, Automation } from "../lib/types";
import { MessageBubble } from "./message-bubble";
import type { ChatMessage } from "../lib/types";
import {
  ASSISTANT_SUGGESTED,
  assistantErrorText,
  automationDemoMessage,
  automationPrompt,
  nextChatId,
  runAssistantTurn,
} from "../lib/chat-core";
import { isAgentStreamConfigured } from "@/shared/agentic/host";
import { ChatComposer } from "./chat-composer";
import { EmptyState } from "./empty-state";

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
      const userMsg: ChatMessage = { id: nextChatId(), role: "user", text };
      const replyId = nextChatId();
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
        await runAssistantTurn(a, messages, text, { onDelta: append });
      } catch (err) {
        const note = assistantErrorText(err);
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
      if (isAgentStreamConfigured()) {
        void send(automationPrompt(auto));
        return;
      }
      const body = automationDemoMessage(auto, runAgent ?? agentRef.current);
      setMessages((prev) => [...prev, { id: nextChatId(), role: "assistant", text: body }]);
    },
  }));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border bg-card/40 px-3 py-2 [scrollbar-width:none]">
        {switcher}
      </div>
      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto">
          <EmptyState prompts={[...ASSISTANT_SUGGESTED]} onPick={send} />
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

"use client";

// Floating chat button + popover panel.
//
// Two backends, auto-selected at runtime:
//   • When the shared agentic model seam is wired (`configureAgentStream`),
//     the FAB drives the GLOBAL tool registry — every slice that called
//     `useAgentTools` is callable through this one chat (one agent, many
//     slices). No props needed.
//   • Otherwise it answers with `stubReply` so the widget ships inert into
//     consumer templates and never needs a key at build/prerender time.
//
// Usage in your app/layout.tsx:
//   import { ChatFab } from "@/features/ai-router/components/chat-fab";
//   <ChatFab tier="mid" />

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X } from "lucide-react";
import {
  isAgentStreamConfigured,
  runAgentLoop,
  globalToolRegistry,
  type AgentMsg,
} from "@/shared/agentic";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Tier = "nano" | "mid" | "flagship";
type Message = { id: string; role: "user" | "assistant"; content: string };

export function ChatFab({
  tier = "mid",
  greeting = "Hi — how can I help you?",
  title = "Chat",
  placeholder = "Type a message…",
}: {
  tier?: Tier;
  /** First assistant message (English default — override for i18n). */
  greeting?: string;
  /** Panel header label. */
  title?: string;
  /** Composer input placeholder. */
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "greet", role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function send() {
    const prompt = input.trim();
    if (!prompt || pending) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: prompt };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPending(true);

    try {
      let text: string;
      if (isAgentStreamConfigured()) {
        // Anthropic requires the first message to be `user`; drop the leading
        // cosmetic greeting (and any assistant msg before the first user turn).
        const msgs: AgentMsg[] = [];
        for (const m of messages) {
          if (msgs.length === 0 && m.role !== "user") continue;
          msgs.push({ role: m.role, text: m.content });
        }
        msgs.push({ role: "user", text: prompt });
        const res = await runAgentLoop(msgs, globalToolRegistry(), {}, 6);
        text = res.text || "(no response)";
      } else {
        text = await stubReply(prompt);
      }
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: text }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `(error) ${err instanceof Error ? err.message : "unknown"}`,
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button
        size="lg"
        onClick={() => setOpen(true)}
        aria-label="Open chat"
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full p-0 shadow-lg"
      >
        <Bot className="size-5" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 flex h-[28rem] w-[20rem] flex-col overflow-hidden border-border/60 shadow-xl sm:w-[24rem]">
      <header className="flex items-center justify-between border-b border-border/60 px-4 py-2">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-foreground/70" />
          <span className="text-sm font-medium">{title}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {tier}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
          className="size-6 rounded text-muted-foreground hover:bg-accent/40 hover:text-foreground"
        >
          <X className="size-4" />
        </Button>
      </header>
      <CardContent ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm",
              m.role === "user"
                ? "ml-auto bg-foreground text-background"
                : "bg-muted text-foreground",
            )}
          >
            {m.content}
          </div>
        ))}
        {pending && (
          <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            …
          </div>
        )}
      </CardContent>
      <footer className="flex gap-2 border-t border-border/60 p-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder={placeholder}
          className="flex-1 text-sm"
          disabled={pending}
        />
        <Button size="sm" onClick={send} disabled={pending || !input.trim()} aria-label="Send">
          <Send className="size-4" />
        </Button>
      </footer>
    </Card>
  );
}

async function stubReply(prompt: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 400));
  return `(stub) Received: "${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}". Wire ChatFab to api.features.ai.actions.callModel for real responses.`;
}

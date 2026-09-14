"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  assistantMessage,
  greetingMessage,
  routePrompt,
  userMessage,
  type AiRouterMessage,
  type AiRouterRoute,
  type RouteTier,
} from "../lib/core";

export type ChatFabProps = {
  route?: AiRouterRoute;
  feature?: string;
  tier?: RouteTier;
  greeting?: string;
  title?: string;
  placeholder?: string;
};

export function ChatFab({
  route,
  feature = "chat-fab",
  tier = "mid",
  greeting = "Hi — how can I help you?",
  title = "Chat",
  placeholder = "Type a message…",
}: ChatFabProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiRouterMessage[]>(() => [greetingMessage(greeting)]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  async function send() {
    const prompt = input.trim();
    if (!prompt || pending) return;
    const stamp = Date.now();
    setMessages((current) => [...current, userMessage(`u-${stamp}`, prompt)]);
    setInput("");
    setPending(true);

    try {
      const result = await routePrompt(route, { feature, tier, prompt });
      setMessages((current) => [...current, assistantMessage(`a-${stamp}`, result)]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `err-${stamp}`,
          role: "assistant",
          content: `(error) ${error instanceof Error ? error.message : "unknown"}`,
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
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close chat" className="size-6">
          <X className="size-4" />
        </Button>
      </header>
      <CardContent ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm",
              message.role === "user" ? "ml-auto bg-foreground text-background" : "bg-muted text-foreground",
            )}
          >
            {message.content}
          </div>
        ))}
        {pending && <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">…</div>}
      </CardContent>
      <footer className="flex gap-2 border-t border-border/60 p-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && !event.shiftKey && send()}
          placeholder={placeholder}
          className="flex-1 text-sm"
          disabled={pending}
          aria-label="Message"
        />
        <Button size="sm" onClick={send} disabled={pending || !input.trim()} aria-label="Send">
          <Send className="size-4" />
        </Button>
      </footer>
    </Card>
  );
}

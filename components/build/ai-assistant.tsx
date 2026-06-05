"use client";

/**
 * Builder AI assistant (VP wave) — chat over /api/build-chat. The model does
 * function-calling against the dynamic slice tool surface; validated
 * preview_slice calls come back as actions and render live via
 * <VariantPreview/> inline with the reply.
 */

import * as React from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { VariantPreview } from "./variant-preview";
import type { PreviewAction } from "@/lib/preview/ai-tools";

interface Turn {
  role: "user" | "assistant";
  text: string;
  actions?: PreviewAction[];
  notice?: boolean;
}

const SUGGESTIONS = [
  "Show me the markdown slice with CRUD tabs",
  "Preview notion-database as a board",
  "Compose a bundle with markdown + files",
];

export function AiAssistant() {
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [text, setText] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, pending]);

  async function send(q: string) {
    const question = q.trim();
    if (!question || pending) return;
    setText("");
    const nextTurns: Turn[] = [...turns, { role: "user", text: question }];
    setTurns(nextTurns);
    setPending(true);
    try {
      const res = await fetch("/api/build-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: nextTurns.map((t) => ({ role: t.role, content: t.text })),
        }),
      });
      const data = (await res.json()) as {
        text?: string; actions?: PreviewAction[]; notice?: string; error?: string;
      };
      setTurns((t) => [
        ...t,
        data.notice || data.error
          ? { role: "assistant", text: data.notice ?? data.error ?? "", notice: true }
          : { role: "assistant", text: data.text ?? "", actions: data.actions },
      ]);
    } catch (e) {
      setTurns((t) => [
        ...t,
        { role: "assistant", text: `Request failed: ${(e as Error).message}`, notice: true },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-border/60 bg-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2 text-xs font-medium">
        <Sparkles className="size-3.5 text-primary" /> Builder AI
        <span className="font-normal text-muted-foreground">— ask for a slice, see it live</span>
      </div>
      <div ref={scrollRef} className="max-h-[28rem] space-y-3 overflow-y-auto p-3">
        {turns.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <Button
                key={s}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => send(s)}
                className="h-auto rounded-full px-3 py-1 text-xs font-normal text-muted-foreground"
              >
                {s}
              </Button>
            ))}
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className="space-y-2">
            <div className={cn("flex", t.role === "user" ? "justify-end" : "justify-start")}>
              {(t.text || t.role === "user") && (
                <div
                  className={cn(
                    "max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs",
                    t.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : t.notice
                        ? "border border-dashed border-border/70 bg-muted/40 text-muted-foreground"
                        : "bg-muted text-foreground",
                  )}
                >
                  {t.text}
                </div>
              )}
            </div>
            {t.actions?.map((a, j) => (
              <VariantPreview
                key={`${i}-${j}-${a.slug}-${a.component}`}
                slug={a.slug}
                component={a.component}
                initialVariant={a.variant}
              />
            ))}
          </div>
        ))}
        {pending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bot className="size-3.5 animate-pulse" /> thinking…
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(text);
        }}
        className="flex items-center gap-2 border-t border-border/60 p-2"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. preview the markdown slice in crud mode…"
          className="h-8 text-xs"
          disabled={pending}
        />
        <Button type="submit" size="icon" className="size-8 shrink-0" aria-label="Send" disabled={pending}>
          <Send className="size-3.5" />
        </Button>
      </form>
    </div>
  );
}

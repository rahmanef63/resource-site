"use client";

/**
 * Real AI assistant FAB — replaces the old canned `ai-fab.tsx`.
 *
 * Props-driven (portable-slice rule R3): the backend call is INJECTED via the
 * `chat` prop instead of importing convex/react here. Typical wiring:
 *
 *   const chat = useAction(api.features.aiRouter.action.callModel);
 *   <AiChatFab brand="acme" chat={chat} />
 *
 * The convex action (`convex/features/aiRouter/action.ts`) is key-guarded:
 * when the provider key is not set it returns `{ ok: false, notice }` so
 * this widget degrades gracefully — the build / prerender never needs the key.
 * Without a `chat` prop the widget still renders and answers with a
 * wire-me-up notice. (The rr `aiChat` backend was not installed in superspace;
 * point the injected action at `aiRouter`, or reuse the existing `ai` engine.)
 */

import * as React from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; text: string; notice?: boolean };

export type AiChatSendResult = { ok: boolean; text?: string; notice?: string };
export type AiChatSend = (args: {
  prompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}) => Promise<AiChatSendResult>;

const SUGGESTIONS = [
  "Apa saja layanan yang ditawarkan?",
  "Bagaimana cara mulai kerja sama?",
  "Berapa estimasi harga & waktunya?",
];

export function AiChatFab({ brand = "kami", chat }: { brand?: string; chat?: AiChatSend }) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [msgs, setMsgs] = React.useState<Msg[]>([
    {
      role: "assistant",
      text: `Hai 👋 aku asisten ${brand}. Tanya apa saja soal layanan, harga, atau cara mulai.`,
    },
  ]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  async function send(q: string) {
    const question = q.trim();
    if (!question || pending) return;
    setText("");
    const history = msgs
      .filter((m) => !m.notice)
      .map((m) => ({ role: m.role, content: m.text }));
    setMsgs((m) => [...m, { role: "user", text: question }]);
    if (!chat) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: "AI belum terhubung — pass the `chat` prop (e.g. useAction(api.features.aiRouter.action.callModel)).",
          notice: true,
        },
      ]);
      return;
    }
    setPending(true);
    try {
      const res = await chat({ prompt: question, history });
      if (res.ok && res.text) {
        setMsgs((m) => [...m, { role: "assistant", text: res.text! }]);
      } else {
        setMsgs((m) => [
          ...m,
          { role: "assistant", text: res.notice ?? "AI is unavailable right now.", notice: true },
        ]);
      }
    } catch (e) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: `Koneksi ke asisten gagal: ${(e as Error).message}`,
          notice: true,
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {open && (
        <Card className="fixed bottom-20 right-5 z-40 flex h-[26rem] w-[20rem] flex-col overflow-hidden border-border/60 shadow-xl sm:w-[22rem]">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-primary" /> Asisten {brand}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Tutup"
              className="size-6 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </Button>
          </div>
          <CardContent ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : m.notice
                        ? "border border-dashed border-border/70 bg-muted/40 text-muted-foreground"
                        : "bg-muted text-foreground",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">…</div>
              </div>
            )}
            {msgs.length <= 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => send(s)}
                    className="h-auto rounded-full border-border/60 px-3 py-1 text-xs font-normal text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(text);
            }}
            className="flex items-center gap-2 border-t p-3"
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Tulis pesan"
              placeholder="Tulis pesan…"
              className="h-9"
              disabled={pending}
            />
            <Button type="submit" size="icon" className="h-9 w-9 shrink-0" aria-label="Kirim" disabled={pending}>
              <Send className="size-4" />
            </Button>
          </form>
        </Card>
      )}
      <Button
        type="button"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-label="Buka asisten AI"
        className="fixed bottom-5 right-5 z-40 size-12 rounded-full shadow-xl transition hover:-translate-y-0.5"
      >
        {open ? <X className="size-5" /> : <Bot className="size-5" />}
      </Button>
    </>
  );
}

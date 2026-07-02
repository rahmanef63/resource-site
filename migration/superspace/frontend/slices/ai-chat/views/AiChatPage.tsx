"use client"

/**
 * AI Chat — Workbench view. FUNCTIONAL: wired to the existing shared AI engine
 * (frontend/shared/ai) — real Convex sessions + the /api/ai/chat provider proxy
 * (OpenRouter default, env-key fallback). Provider/model/API key come from AI
 * Settings; if the server has OPENROUTER_API_KEY set it works with no client
 * config. This deliberately reuses the shared engine instead of the rr aiChat
 * backend (which was never installed and is pinned to an incompatible ai@4).
 *
 * Default export name matches config.ui.component ("AiChatPage").
 */

import * as React from "react"
import { Bot, Send, Sparkles, Loader2, Plus } from "lucide-react"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
// Narrow sub-path imports (NOT the full @/frontend/shared/ai barrel) — the full
// barrel pulls in the agent/registry type chains that trip TS2589 in next build.
import { useInitializeAI, useAIActions } from "@/frontend/shared/ai/hooks"
import { useAIStore } from "@/frontend/shared/ai/stores"

export default function AiChatPage() {
  // Init the shared AI store (loads sessions, sets workspace/user context).
  useInitializeAI()
  const { createSession, sendMessage, selectSession } = useAIActions()
  const selectedSession = useAIStore((s) => s.selectedSession)
  const isSending = useAIStore((s) => s.isSending)
  const [text, setText] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const messages = selectedSession?.messages ?? []

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages.length, isSending])

  const handleSend = React.useCallback(async () => {
    const content = text.trim()
    if (!content || isSending) return
    setText("")

    // Reuse the active session, or spin up a new one on the first message.
    let sessionId = selectedSession?._id
    if (!sessionId) {
      const session = await createSession(content.slice(0, 40) || "New Chat")
      if (!session) return
      selectSession(session._id)
      sessionId = session._id
    }
    if (!sessionId) return
    await sendMessage(content, undefined, sessionId)
  }, [text, isSending, selectedSession, createSession, selectSession, sendMessage])

  return (
    <FeatureShell featureId="ai-chat">
      <div className="mx-auto flex h-[calc(100dvh-9rem)] w-full max-w-3xl flex-col">
        <div className="flex items-center justify-between gap-2 border-b px-1 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="size-4 text-primary" /> AI Chat
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => selectSession(null)}
            className="h-8 gap-1 text-xs"
          >
            <Plus className="size-3.5" /> New
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto py-4">
          {messages.length === 0 && !isSending && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <Bot className="size-8 opacity-40" />
              <p className="max-w-sm">
                Tanya apa saja. Provider &amp; API key diatur di AI Settings
                (default: OpenRouter, pakai server env key kalau ada).
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={m.id ?? i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "flex max-w-[85%] items-start gap-2 whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {m.role !== "user" && <Bot className="mt-0.5 size-4 shrink-0 opacity-70" />}
                <span>{m.content}</span>
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Menulis…
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSend()
          }}
          className="flex items-center gap-2 border-t pt-3"
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Tulis pesan"
            placeholder="Tulis pesan…"
            className="h-10"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-label="Kirim"
            disabled={isSending || !text.trim()}
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </FeatureShell>
  )
}

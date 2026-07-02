"use client"

import * as React from "react"
import { Bot, Sparkles, Plus } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { AIChatListCard } from "../components/AIChatListCard"
import type { AISession } from "../stores"

const NOW = Date.now()
const _id = (raw: string) => raw as unknown as AISession["_id"]

const MOCK_SESSIONS: AISession[] = [
  {
    _id: _id("aichat_1"), id: "aichat_1",
    workspaceId: "ws_demo", userId: "user_demo",
    title: "Q2 sales analysis",
    icon: "TrendingUp", topic: "Revenue + churn breakdown",
    isGlobal: false, isPinned: true,
    messages: [{ role: "user", content: "Summarize Q2 sales by region", timestamp: NOW - 3_600_000 } as any],
    status: "active",
    createdAt: NOW - 3_600_000 * 24, updatedAt: NOW - 3_600_000,
    tags: ["sales", "analysis"],
  },
  {
    _id: _id("aichat_2"), id: "aichat_2",
    workspaceId: "ws_demo", userId: "user_demo",
    title: "Onboarding email draft",
    icon: "Mail", topic: "Welcome email for SMB tier",
    isGlobal: false, isFavorite: true,
    messages: [{ role: "user", content: "Draft a friendly welcome email", timestamp: NOW - 86_400_000 } as any],
    status: "active",
    createdAt: NOW - 86_400_000 * 2, updatedAt: NOW - 86_400_000,
    tags: ["copywriting"],
  },
  {
    _id: _id("aichat_3"), id: "aichat_3",
    workspaceId: "ws_demo", userId: "user_demo",
    title: "Database schema review",
    icon: "Database", topic: "Postgres → Convex migration plan",
    isGlobal: true,
    messages: [{ role: "user", content: "Review my schema for indexes", timestamp: NOW - 86_400_000 * 3 } as any],
    status: "active",
    createdAt: NOW - 86_400_000 * 7, updatedAt: NOW - 86_400_000 * 3,
    tags: ["engineering", "review"],
  },
]

const SUGGESTIONS = [
  { icon: "📊", text: "Analyze our Q2 metrics" },
  { icon: "✍️",  text: "Draft a customer reply" },
  { icon: "🧠", text: "Summarize this thread" },
  { icon: "🔍", text: "Find similar cases" },
]

function AIPreview({ compact }: FeaturePreviewProps) {
  const [activeId, setActiveId] = React.useState<string>(MOCK_SESSIONS[0]._id)

  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">AI Assistant</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_SESSIONS.length} chats · Multi-agent
        </p>
      </div>
    )
  }

  const active = MOCK_SESSIONS.find((s) => s._id === activeId) ?? MOCK_SESSIONS[0]

  return (
    <div className="grid h-full grid-cols-[260px_1fr] overflow-hidden">
      <aside className="flex flex-col gap-1 overflow-auto border-r p-2">
        <div className="mb-1 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chats</span>
          <Button aria-label="Add" size="icon" variant="ghost" className="h-6 w-6"><Plus className="h-3.5 w-3.5" /></Button>
        </div>
        {MOCK_SESSIONS.map((s) => (
          <AIChatListCard
            key={s._id}
            session={s}
            isActive={s._id === active._id}
            onClick={() => setActiveId(s._id)}
          />
        ))}
      </aside>

      <main className="flex flex-col overflow-hidden">
        <div className="flex flex-shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{active.title}</span>
            {active.isGlobal && <Badge variant="secondary" className="text-[10px]">Global</Badge>}
          </div>
          <span className="text-xs text-muted-foreground">{active.tags?.join(" · ")}</span>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="mx-auto max-w-md text-center text-muted-foreground">
            <Sparkles className="mx-auto h-8 w-8 text-primary/60" />
            <p className="mt-3 text-sm">Pick a suggestion or ask anything.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  type="button"
                  className="rounded-md border bg-card px-3 py-2 text-left text-xs hover:bg-accent"
                >
                  <span className="mr-1.5">{s.icon}</span>{s.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "ai",
  name: "AI Assistant",
  description: "Multi-agent AI chat with context, tools, and shared knowledge.",
  component: AIPreview,
  category: "productivity",
  tags: ["ai", "chat", "agents", "copilot"],
  mockDataSets: [
    {
      id: "default",
      name: "Active chat sessions",
      description: "3 mock sessions (sales, copywriting, engineering) wired through real AIChatListCard.",
      data: { sessions: MOCK_SESSIONS, suggestions: SUGGESTIONS },
    },
  ],
})

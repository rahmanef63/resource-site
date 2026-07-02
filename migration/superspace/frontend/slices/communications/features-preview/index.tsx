"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { MessageItem } from "../components/MessageItem"
import { type Message } from "../shared"

const NOW = Date.now()
const iso = (offset: number) => new Date(NOW - offset).toISOString()
const fmt = (offset: number) => {
  const h = Math.floor(offset / 3_600_000)
  return h >= 1 ? `${h}h ago` : `${Math.max(1, Math.floor(offset / 60_000))}m ago`
}

const MOCK_MESSAGES: Message[] = [
  {
    id: "m_1", channelId: "general",
    senderId: "u_alif", senderType: "user",
    sender: { id: "u_alif", name: "Alif Pratama" },
    content: "Morning team — pushing v2.4 rc1 to staging in 10 minutes.",
    type: "text",
    createdAt: iso(3_600_000 * 4), timestamp: fmt(3_600_000 * 4),
  },
  {
    id: "m_2", channelId: "general",
    senderId: "u_bella", senderType: "user",
    sender: { id: "u_bella", name: "Bella Setiawan" },
    content: "Nice. I'll cover the smoke tests on mobile.",
    type: "text",
    createdAt: iso(3_600_000 * 4 - 60_000 * 5), timestamp: fmt(3_600_000 * 4 - 60_000 * 5),
  },
  {
    id: "m_3", channelId: "general",
    senderId: "ai_copilot", senderType: "ai",
    sender: { id: "ai_copilot", name: "Copilot", isBot: true },
    content: "Heads up — staging deploy is currently 12% slower than baseline (avg 3.4s for cold start). Consider dropping the migration script size before promoting to prod.",
    type: "ai",
    createdAt: iso(3_600_000 * 3), timestamp: fmt(3_600_000 * 3),
  },
  {
    id: "m_4", channelId: "general",
    senderId: "u_cahya", senderType: "user",
    sender: { id: "u_cahya", name: "Cahya Nugroho" },
    content: "Picked up the cold-start regression — issue is the new RBAC roles seed. PR incoming.",
    type: "text",
    createdAt: iso(3_600_000 * 1), timestamp: fmt(3_600_000 * 1),
  },
]

function CommunicationsPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Communications</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          {MOCK_MESSAGES.length} messages · #general
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b bg-muted/20 px-4 py-3">
        <h3 className="text-base font-semibold"># general</h3>
        <p className="text-xs text-muted-foreground">Team chat — uses real {`<MessageItem>`} component</p>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {MOCK_MESSAGES.map((m, i) => (
          <MessageItem
            key={m.id}
            message={m}
            isGrouped={i > 0 && MOCK_MESSAGES[i - 1].senderId === m.senderId}
          />
        ))}
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "communications",
  name: "Communications",
  description: "Team chat with channels, DMs, threads, AI assistant, and reactions.",
  component: CommunicationsPreview,
  category: "communication",
  tags: ["chat", "channels", "messages", "ai"],
  mockDataSets: [
    {
      id: "default",
      name: "#general thread",
      description: "Mix of human + AI messages around a deploy regression.",
      data: { messages: MOCK_MESSAGES },
    },
  ],
})

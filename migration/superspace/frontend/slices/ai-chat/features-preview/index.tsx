"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

function AiChatPreview(_props: FeaturePreviewProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="text-2xl font-bold">AI Chat</div>
      <p className="text-sm text-muted-foreground">
        Chat workbench ala Claude.ai / ChatGPT — kirim pesan ke asisten AI.
      </p>
      <div className="space-y-2">
        <div className="ml-auto max-w-[80%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground">
          Ringkas rencana peluncuran produk jadi 3 poin.
        </div>
        <div className="max-w-[80%] rounded-2xl bg-muted px-3 py-2 text-sm">
          Tentu — 1) riset harga pesaing, 2) siapkan foto produk, 3) posting promo di blog.
        </div>
        <div className="max-w-[80%] rounded-2xl border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          💡 Scaffold: sambungkan backend untuk balasan model sungguhan.
        </div>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "ai-chat",
  name: "AI Chat",
  description: "Chat workbench ala Claude.ai / ChatGPT — kirim pesan ke asisten AI.",
  component: AiChatPreview,
  category: "productivity",
  mockDataSets: [
    {
      id: "ai-chat-default",
      name: "Sample conversation",
      description: "A sample chat thread showing a user prompt and assistant reply.",
      data: {},
    },
  ],
})

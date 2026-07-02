"use client"

import * as React from "react"
import { Command, Search } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

function CommandMenuPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Command Menu</h3>
        <p className="mt-2 text-xs text-muted-foreground">⌘K palette</p>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="w-full max-w-md overflow-hidden rounded-md border bg-card shadow-lg">
        <div className="flex items-center gap-3 border-b px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-sm text-muted-foreground">Type a command or search…</span>
          <kbd className="rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground">esc</kbd>
        </div>
        <div className="p-2 text-xs">
          <div className="px-2 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">Actions</div>
          <div className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-accent">
            <Command className="h-3.5 w-3.5" />
            <span className="flex-1">New page</span>
            <kbd className="text-[10px] text-muted-foreground">⌘N</kbd>
          </div>
        </div>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "command-menu",
  name: "Command Menu",
  description: "Renderless ⌘K palette + search modal — consumer-supplied groups, slice owns chrome.",
  component: CommandMenuPreview,
  category: "productivity",
  tags: ["palette", "cmd-k", "search", "library"],
  mockDataSets: [
    {
      id: "default",
      name: "Palette mock",
      description: "Static preview of the palette dialog with one Actions group entry.",
      data: {},
    },
  ],
})

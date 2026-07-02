"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

function NotificationsPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p className="mt-2 text-xs text-muted-foreground">Per-page subscribe popover</p>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm">
        <Bell className="h-5 w-5 text-primary" />
        <div className="text-sm">
          <div className="font-medium">Notify me when…</div>
          <div className="text-xs text-muted-foreground">All page activity · Comments · Edits</div>
        </div>
      </div>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "notifications",
  name: "Notifications",
  description: "Per-page Notify Me popover with localStorage-backed subscription state.",
  component: NotificationsPreview,
  category: "communication",
  tags: ["notifications", "popover", "library"],
  mockDataSets: [
    {
      id: "default",
      name: "Notify popover",
      description: "Static preview of the notify-me popover header + scopes.",
      data: {},
    },
  ],
})

"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

function StorePreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Store</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          Workspace hierarchy + menu management
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Store</h3>
        <p className="text-xs text-muted-foreground">
          Unified store for workspace structure and menu installation. Workspace
          tab is visible to all members. Menu tab requires{" "}
          <code className="rounded bg-muted px-1 py-0.5">manage_menus</code>{" "}
          permission.
        </p>
      </div>
      <ul className="space-y-2 text-sm">
        <li className="rounded border bg-card p-3">
          <p className="font-medium">Workspace tab</p>
          <p className="text-xs text-muted-foreground">
            Tree of nested workspaces, drag-and-drop, color + icon picker.
          </p>
        </li>
        <li className="rounded border bg-card p-3">
          <p className="font-medium">Menu tab (gated)</p>
          <p className="text-xs text-muted-foreground">
            Install features, configure menu items, preview navigation.
          </p>
        </li>
      </ul>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "store",
  name: "Store",
  description:
    "Unified workspace + menu management. Role-gated tabs (Workspace for everyone, Menu for manage_menus role).",
  component: StorePreview,
  category: "administration",
  tags: ["workspace", "menus", "system", "administration"],
  mockDataSets: [
    {
      id: "default",
      name: "Default preview",
      description: "Static overview of Store tabs and gating.",
      data: {},
    },
  ],
})

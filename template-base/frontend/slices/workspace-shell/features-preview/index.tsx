"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

/**
 * workspace-shell — onboarding preview (P0 stub).
 *
 * Real preview lands in P3 (2-tier dropdown demo). For now shows a mock
 * switcher chip illustrating the (workspace × menuSet) concept.
 */
function WorkspaceShellPreview({ compact }: FeaturePreviewProps) {
  return (
    <div className={compact ? "p-2" : "p-4"}>
      <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm">
        <span className="font-medium">🏢 Acme HQ</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">📋 My Custom Menu</span>
        <span className="text-xs text-muted-foreground">▾</span>
      </div>
      {!compact && (
        <p className="mt-3 text-xs text-muted-foreground">
          Atomic 2-axis switcher — pick workspace and menu set in one dropdown.
        </p>
      )}
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "workspace-shell",
  name: "Workspace Shell",
  description:
    "Atomic 2-axis workspace + menuSet switcher with NavContext primitive.",
  component: WorkspaceShellPreview,
  category: "administration",
  tags: ["navigation", "workspace", "menu", "shell"],
  mockDataSets: [
    {
      id: "default",
      name: "Default preview",
      description: "Mock context badge illustrating workspace + menuSet pairing.",
      data: {},
    },
  ],
})

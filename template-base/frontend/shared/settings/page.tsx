"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { SettingsView } from "./SettingsView"

interface SettingsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function SettingsPage({ workspaceId }: SettingsPageProps) {
  return (
    <div className="h-full">
      <SettingsView />
    </div>
  )
}

"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { AIView } from "./AIView"

interface AIPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAAIPage({ workspaceId }: AIPageProps) {
  // AIView now handles its own initialization via useInitializeAI hook
  void workspaceId

  return (
    <div className="h-full">
      <AIView />
    </div>
  )
}

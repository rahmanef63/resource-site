"use client"

import type { Id } from "@convex/_generated/dataModel"
import CommunicationsPage from "./views/CommunicationsPage"

export interface CommunicationsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Communications Feature Entry Point
 * 
 * Unified communication platform - channels, DMs, calls, AI
 * @see docs/guides/FEATURE_CREATION_TEMPLATE.md
 */
export default function Page({ workspaceId }: CommunicationsPageProps) {
  return <CommunicationsPage workspaceId={workspaceId} />
}

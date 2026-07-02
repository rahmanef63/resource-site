"use client"

import type { Id } from "@convex/_generated/dataModel"
import MarketingPage from "./views/MarketingPage"

export interface MarketingPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: MarketingPageProps) {
  return <MarketingPage workspaceId={workspaceId} />
}

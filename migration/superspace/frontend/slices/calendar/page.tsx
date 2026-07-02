"use client"

import type { Id } from "@convex/_generated/dataModel"
import CalendarPage from "./views/CalendarPage"

export interface CalendarPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: CalendarPageProps) {
  return <CalendarPage workspaceId={workspaceId} />
}

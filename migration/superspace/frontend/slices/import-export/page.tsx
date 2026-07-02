"use client"

import type { Id } from "@convex/_generated/dataModel"
import ImportExportPage from "./views/ImportExportPage"

export interface ImportExportPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: ImportExportPageProps) {
  return <ImportExportPage workspaceId={workspaceId} />
}

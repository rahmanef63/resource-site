"use client"

import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { EditorAdapterProvider, PageEditor } from "@notion/slices/editor"
import { useLocalNotionAdapter, HOME_PAGE_ID } from "../lib/localAdapter"

export default function NotionPage() {
  const { workspaceId } = useWorkspaceContext()

  return (
    <FeatureShell featureId="notion">
      {workspaceId ? (
        // key remounts (and reloads localStorage) when the workspace changes.
        <NotionEditor key={String(workspaceId)} workspaceId={String(workspaceId)} />
      ) : (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Pilih workspace untuk mulai menulis.
        </div>
      )}
    </FeatureShell>
  )
}

function NotionEditor({ workspaceId }: { workspaceId: string }) {
  const adapter = useLocalNotionAdapter(workspaceId)
  return (
    <EditorAdapterProvider adapter={adapter}>
      {/* ponytail: fixed viewport-relative height so the editor's internal
          scroll works; tune the offset if the dashboard chrome changes. */}
      <div className="h-[calc(100dvh-9rem)]">
        <PageEditor pageId={HOME_PAGE_ID} />
      </div>
    </EditorAdapterProvider>
  )
}

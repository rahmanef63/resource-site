"use client"

import * as React from "react"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { Building2, ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Doc } from "@/convex/_generated/dataModel"

interface TreeNode {
  workspace: Doc<"workspaces">
  children: TreeNode[]
}

function buildTree(
  flat: Doc<"workspaces">[],
  rootId: string | null,
): TreeNode[] {
  return flat
    .filter((w) => (w.parentWorkspaceId ?? null) === rootId)
    .map((w) => ({
      workspace: w,
      children: buildTree(flat, String(w._id)),
    }))
}

function TreeRow({
  node,
  depth,
  currentId,
  isMain,
  onSelect,
}: {
  node: TreeNode
  depth: number
  currentId: string | null
  isMain: boolean
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = React.useState(true)
  const hasChildren = node.children.length > 0
  const id = String(node.workspace._id)
  const selected = id === currentId

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer",
          selected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
        )}
        style={{ paddingLeft: depth * 16 + 8 }}
        onClick={() => onSelect(id)}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setOpen((o) => !o)
            }}
            className="hover:bg-muted rounded p-0.5"
          >
            <ChevronRight
              className={cn(
                "h-3 w-3 opacity-60 transition-transform",
                open && "rotate-90",
              )}
            />
          </button>
        ) : (
          <span className="w-4" />
        )}
        {isMain ? (
          <Home className="h-3.5 w-3.5 text-blue-500" />
        ) : (
          <Building2 className="h-3.5 w-3.5 opacity-70" />
        )}
        <span className="truncate flex-1">{node.workspace.name}</span>
        {hasChildren && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {node.children.length}
          </span>
        )}
      </div>
      {hasChildren && open && (
        <>
          {node.children.map((child) => (
            <TreeRow
              key={String(child.workspace._id)}
              node={child}
              depth={depth + 1}
              currentId={currentId}
              isMain={false}
              onSelect={onSelect}
            />
          ))}
        </>
      )}
    </>
  )
}

/**
 * TreeTab — workspace hierarchy viewer (P4 read-only).
 * Drag-n-drop reorder + create/edit/delete dialogs deferred to follow-up.
 */
export function TreeTab() {
  const { workspaces, workspaceId, mainWorkspace, setWorkspaceId } =
    useWorkspaceContext()

  const list = workspaces ?? []
  const tree = React.useMemo(() => buildTree(list, null), [list])
  const currentId = workspaceId ? String(workspaceId) : null
  const mainId = mainWorkspace ? String(mainWorkspace._id) : null

  return (
    <div className="space-y-3">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Workspace tree</h3>
          <p className="text-xs text-muted-foreground">
            {list.length} workspaces. Click to switch.
          </p>
        </div>
        <span className="text-xs text-muted-foreground italic">
          Drag-reorder + edit coming in P4-follow-up
        </span>
      </header>
      <div className="rounded-md border bg-card p-2 max-h-[600px] overflow-y-auto">
        {tree.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No workspaces yet.
          </div>
        ) : (
          tree.map((node) => (
            <TreeRow
              key={String(node.workspace._id)}
              node={node}
              depth={0}
              currentId={currentId}
              isMain={String(node.workspace._id) === mainId}
              onSelect={(id) => setWorkspaceId(id as any)}
            />
          ))
        )}
      </div>
    </div>
  )
}

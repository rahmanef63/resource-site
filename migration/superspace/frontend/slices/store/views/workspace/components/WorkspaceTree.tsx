/**
 * Workspace Tree Component
 * 
 * Renders workspaces in a tree structure with DnD support
 */

"use client"

import * as React from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkspaceCard } from "./WorkspaceCard"
import { useWorkspaceStoreState, useWorkspaceDnDState } from "../hooks"
import { useWorkspaceStoreMutations } from "../hooks"
import type { WorkspaceStoreItem } from "../types"
import { wouldCreateCycle } from "@/frontend/shared/foundation/stores"

export interface WorkspaceTreeProps {
  workspaces: WorkspaceStoreItem[]
  selectedId?: string | null
  expandedIds?: Set<string>
  onSelect?: (id: string) => void
  onToggleExpand?: (id: string) => void
  onMove?: (data: { workspaceId: string; newParentId: string | null; newSortOrder: number }) => void
  onEdit?: (workspace: WorkspaceStoreItem) => void
  onDelete?: (workspace: WorkspaceStoreItem) => void
  onAddChild?: (workspace: WorkspaceStoreItem) => void
  onSetColor?: (workspace: WorkspaceStoreItem, color: string) => void
  onUnlink?: (workspace: WorkspaceStoreItem) => void
  showActions?: boolean
  maxDepth?: number
}

export function WorkspaceTree({
  workspaces,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onMove,
  onEdit,
  onDelete,
  onAddChild,
  onSetColor,
  onUnlink,
  showActions = true,
  maxDepth = 6,
}: WorkspaceTreeProps) {
  const { setDragging, setOverId, draggedId } = useWorkspaceDnDState()
  const { moveWorkspace } = useWorkspaceStoreMutations()
  
  // Active item for overlay
  const [activeItem, setActiveItem] = React.useState<WorkspaceStoreItem | null>(null)
  
  // Build items map for cycle detection
  const itemsMap = React.useMemo(() => {
    const map = new Map<string, WorkspaceStoreItem>()
    workspaces.forEach((ws) => map.set(ws.id, ws))
    return map
  }, [workspaces])
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Build tree structure
  const tree = React.useMemo(() => {
    const rootItems: WorkspaceStoreItem[] = []
    const childrenMap = new Map<string | null, WorkspaceStoreItem[]>()
    
    // Group by parent
    for (const ws of workspaces) {
      const parentId = ws.parentId
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, [])
      }
      childrenMap.get(parentId)!.push(ws)
    }
    
    // Sort each group
    for (const children of childrenMap.values()) {
      children.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    }
    
    // Build tree recursively
    function buildNode(ws: WorkspaceStoreItem): WorkspaceStoreItem {
      const children = childrenMap.get(ws.id) ?? []
      return {
        ...ws,
        children: children.map(buildNode),
      }
    }
    
    const roots = childrenMap.get(null) ?? []
    return roots.map(buildNode)
  }, [workspaces])
  
  // Get all item IDs for sortable context
  const allIds = React.useMemo(() => {
    return workspaces.map((ws) => ws.id)
  }, [workspaces])
  
  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const item = workspaces.find((ws) => ws.id === active.id)
    if (item) {
      setActiveItem(item)
      setDragging(true, String(active.id))
    }
  }
  
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setOverId(over ? String(over.id) : null)
  }
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveItem(null)
    setDragging(false, null)
    setOverId(null)
    
    if (!over || active.id === over.id) return
    
    const activeId = String(active.id)
    const overId = String(over.id)
    
    const activeItem = itemsMap.get(activeId)
    const overItem = itemsMap.get(overId)
    
    if (!activeItem || !overItem) return
    
    // Check if move would create cycle
    if (wouldCreateCycle(activeId, overId, itemsMap)) {
      console.warn("Move would create cycle, aborting")
      return
    }
    
    // Determine new parent
    // If dropping ON an item, it becomes the parent
    // If dropping BETWEEN items, use same parent as target
    const newParentId = overItem.id
    
    // Call mutation or callback
    if (onMove) {
      onMove({
        workspaceId: activeId,
        newParentId,
        newSortOrder: 0,
      })
    } else {
      try {
        await moveWorkspace({
          workspaceId: activeId,
          newParentId,
          newSortOrder: 0,
        })
      } catch (error) {
        console.error("Failed to move workspace:", error)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="h-full">
        <SortableContext
          items={allIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-0.5 p-2">
            {tree.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                isSelected={selectedId === workspace.id}
                isExpanded={expandedIds?.has(workspace.id) ?? false}
                onSelect={() => onSelect?.(workspace.id)}
                onToggleExpand={() => onToggleExpand?.(workspace.id)}
                onEdit={onEdit ? () => onEdit(workspace) : undefined}
                onDelete={onDelete ? () => onDelete(workspace) : undefined}
                depth={0}
                isDragging={draggedId === workspace.id}
              />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>
      
      {/* Drag overlay */}
      <DragOverlay>
        {activeItem && (
          <div className="bg-background border rounded-md shadow-lg opacity-90">
            <WorkspaceCard
              workspace={activeItem}
              depth={0}
              isDragging
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

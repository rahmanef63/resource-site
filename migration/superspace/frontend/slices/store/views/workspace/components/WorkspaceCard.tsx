/**
 * Workspace Card Component
 * 
 * Displays a single workspace with actions
 */

"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Home,
  Building2,
  Users,
  Heart,
  Briefcase,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Link2,
  Unlink,
  Palette,
  GripVertical,
  Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { WorkspaceCardProps, WorkspaceStoreItem } from "../types"

// Workspace type icons
const WORKSPACE_TYPE_ICONS: Record<string, React.ElementType> = {
  personal: Home,
  organization: Building2,
  institution: Building2,
  group: Users,
  family: Heart,
}

export function WorkspaceCard({
  workspace,
  isSelected = false,
  isExpanded = false,
  onSelect,
  onToggleExpand,
  onEdit,
  onDelete,
  onColorChange,
  onIconChange,
  depth = 0,
  isDragging = false,
  isOver = false,
}: WorkspaceCardProps) {
  const Icon = WORKSPACE_TYPE_ICONS[workspace.type ?? "personal"] ?? Briefcase
  const hasChildren = (workspace.children?.length ?? 0) > 0
  
  // DnD sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: workspace.id,
    data: {
      type: "workspace",
      workspace,
    },
  })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative",
        isSortableDragging && "opacity-50",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <Collapsible open={isExpanded} onOpenChange={() => onToggleExpand?.()}>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
            "hover:bg-accent/50",
            isSelected && "bg-accent",
            isDragging && "bg-accent/70"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* Drag handle */}
          <button
            aria-label="Drag to reorder"
            className="cursor-grab opacity-0 group-hover:opacity-50 hover:opacity-100 touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          
          {/* Expand button */}
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button aria-label="Next" variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-6" />
          )}
          
          {/* Icon */}
          <div
            className="flex h-7 w-7 items-center justify-center rounded text-white shrink-0"
            style={{ backgroundColor: workspace.color }}
          >
            <Icon className="h-4 w-4" />
          </div>
          
          {/* Content */}
          <button
            className="flex-1 text-left min-w-0"
            onClick={() => onSelect?.()}
          >
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium">
                {workspace.name}
              </span>
              {workspace.isMainWorkspace && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  <Crown className="h-2.5 w-2.5 mr-0.5" />
                  Main
                </Badge>
              )}
              {workspace.isLinked && (
                <Link2 className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {workspace.type}
            </span>
          </button>
          
          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="More options"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.()}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onColorChange?.(workspace.color)}>
                <Palette className="h-4 w-4 mr-2" />
                Change Color
              </DropdownMenuItem>
              {workspace.isLinked ? (
                <DropdownMenuItem onClick={() => onDelete?.()}>
                  <Unlink className="h-4 w-4 mr-2" />
                  Unlink
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.()}
                    className="text-destructive focus:text-destructive"
                    disabled={workspace.isMainWorkspace}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Children */}
        {hasChildren && (
          <CollapsibleContent>
            <div className="mt-0.5">
              {(workspace.children as WorkspaceStoreItem[] | undefined)?.map((child) => (
                <WorkspaceCard
                  key={child.id}
                  workspace={child}
                  depth={depth + 1}
                  isSelected={isSelected}
                  isExpanded={isExpanded}
                  onSelect={onSelect}
                  onToggleExpand={onToggleExpand}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onColorChange={onColorChange}
                  onIconChange={onIconChange}
                />
              ))}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  )
}

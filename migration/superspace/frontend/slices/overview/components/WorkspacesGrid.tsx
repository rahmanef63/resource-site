/**
 * Workspaces Grid
 * 
 * Grid display for child workspaces with navigation support.
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Folder, FolderOpen, Plus, ChevronRight, Users } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface WorkspaceItem {
  _id: string
  name: string
  description?: string
  slug?: string
  icon?: string
  color?: string
  memberCount?: number
  isActive?: boolean
}

export interface WorkspacesGridProps {
  /** List of workspaces to display */
  workspaces: WorkspaceItem[]
  /** Currently selected workspace ID */
  selectedId?: string
  /** Click handler */
  onSelect?: (workspace: WorkspaceItem) => void
  /** Create new workspace handler */
  onCreate?: () => void
  /** Show create button */
  showCreate?: boolean
  /** Loading state */
  isLoading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Additional className */
  className?: string
}

// ============================================================================
// Workspace Card
// ============================================================================

export interface WorkspaceCardProps {
  workspace: WorkspaceItem
  isSelected?: boolean
  onSelect?: (workspace: WorkspaceItem) => void
}

export function WorkspaceCard({ workspace, isSelected, onSelect }: WorkspaceCardProps) {
  const Icon = isSelected ? FolderOpen : Folder
  
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md group",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={() => onSelect?.(workspace)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: workspace.color || "hsl(var(--primary) / 0.1)" }}
          >
            {workspace.icon ? (
              <span className="text-xl">{workspace.icon}</span>
            ) : (
              <Icon className="h-5 w-5 text-primary" />
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <CardTitle className="text-base mt-2 line-clamp-1">{workspace.name}</CardTitle>
        {workspace.description && (
          <CardDescription className="line-clamp-2 text-xs">
            {workspace.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          {workspace.memberCount !== undefined && (
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {workspace.memberCount}
            </Badge>
          )}
          {workspace.isActive && (
            <Badge variant="default" className="text-xs">Active</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Create Workspace Card
// ============================================================================

interface CreateWorkspaceCardProps {
  onCreate?: () => void
}

function CreateWorkspaceCard({ onCreate }: CreateWorkspaceCardProps) {
  return (
    <Card 
      className="cursor-pointer border-dashed hover:border-primary transition-colors"
      onClick={onCreate}
    >
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[160px] py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted mb-3">
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Create Workspace</p>
        <p className="text-xs text-muted-foreground">Add a new workspace</p>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function WorkspaceCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-5 w-3/4 mt-2" />
        <Skeleton className="h-4 w-full mt-1" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Workspaces Grid
// ============================================================================

export function WorkspacesGrid({
  workspaces,
  selectedId,
  onSelect,
  onCreate,
  showCreate = true,
  isLoading = false,
  emptyMessage = "No workspaces found",
  className,
}: WorkspacesGridProps) {
  if (isLoading) {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <WorkspaceCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (workspaces.length === 0 && !showCreate) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Folder className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace._id}
          workspace={workspace}
          isSelected={selectedId === workspace._id}
          onSelect={onSelect}
        />
      ))}
      {showCreate && <CreateWorkspaceCard onCreate={onCreate} />}
    </div>
  )
}

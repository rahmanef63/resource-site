"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronUp,
  Home,
  Building2,
  Users,
  Heart,
  Briefcase,
  Crown,
  Loader2,
  Plus,
  Check,
  Settings,
  Pencil,
  Trash2,
  Share2,
  Palette,
} from "lucide-react"
import type { Id, Doc } from "@convex/_generated/dataModel"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { useIsGuestMode, useGuestWorkspaceContext } from "@/frontend/shared/foundation/provider/GuestWorkspaceProvider"
import { DEFAULT_WORKSPACE_COLOR } from "@/frontend/shared/constants/colors"
import { cn } from "@/lib/utils"

// Workspace type icons
const WORKSPACE_TYPE_ICONS: Record<string, React.ElementType> = {
  personal: Home,
  organization: Building2,
  institution: Building2,
  group: Users,
  family: Heart,
}

/**
 * Hook that works with both WorkspaceProvider (authenticated) and GuestWorkspaceProvider (guest mode)
 */
function useUnifiedWorkspaceContext() {
  const isGuestMode = useIsGuestMode()

  // Guest context
  let guestContext: ReturnType<typeof useGuestWorkspaceContext> | null = null
  try {
    if (isGuestMode) {
      guestContext = useGuestWorkspaceContext()
    }
  } catch {
    // Not in guest mode
  }

  // Real context
  let realContext: ReturnType<typeof useWorkspaceContext> | null = null
  try {
    if (!isGuestMode) {
      realContext = useWorkspaceContext()
    }
  } catch {
    // Not in real mode
  }

  if (guestContext) {
    return {
      workspaceId: guestContext.workspaceId as Id<"workspaces"> | null,
      setWorkspaceId: (id: Id<"workspaces"> | null) => guestContext!.setWorkspaceId(id as string | null),
      workspaces: guestContext.workspaces as any[],
      currentWorkspace: guestContext.currentWorkspace as any,
      mainWorkspace: guestContext.mainWorkspace as any,
      isMainWorkspace: guestContext.isMainWorkspace,
      childWorkspaces: guestContext.childWorkspaces as any[],
      siblingWorkspaces: guestContext.siblingWorkspaces as any[],
      workspacePath: guestContext.workspacePath as any[],
      isGuestMode: true,
    }
  }

  if (realContext) {
    return {
      workspaceId: realContext.workspaceId,
      setWorkspaceId: realContext.setWorkspaceId,
      workspaces: realContext.workspaces,
      currentWorkspace: realContext.currentWorkspace,
      mainWorkspace: realContext.mainWorkspace,
      isMainWorkspace: realContext.isMainWorkspace,
      childWorkspaces: realContext.childWorkspaces,
      siblingWorkspaces: realContext.siblingWorkspaces,
      workspacePath: realContext.workspacePath,
      isGuestMode: false,
    }
  }

  // Fallback
  return {
    workspaceId: null as Id<"workspaces"> | null,
    setWorkspaceId: () => { },
    workspaces: undefined as any[] | undefined,
    currentWorkspace: null as any,
    mainWorkspace: null as any,
    isMainWorkspace: false,
    childWorkspaces: [] as any[],
    siblingWorkspaces: [] as any[],
    workspacePath: [] as any[],
    isGuestMode: false,
  }
}

interface WorkspaceSwitcherStackProps {
  onWorkspaceSelect?: (workspaceId: Id<"workspaces">) => void
  onCreateWorkspace?: (parentId?: Id<"workspaces">) => void
  onEditWorkspace?: (workspaceId: Id<"workspaces">) => void
  onDeleteWorkspace?: (workspaceId: Id<"workspaces">) => void
  onPersonalizeWorkspace?: (workspaceId: Id<"workspaces">) => void
  isLoading?: boolean
}

/**
 * Stacked Workspace Switcher
 * 
 * Shows multiple workspace levels as a stack in the sidebar header.
 * Each level shows the current workspace at that level with ability
 * to switch to siblings.
 * 
 * Features:
 * - Visual hierarchy with colors
 * - Navigate to parent (up) or children (down)
 * - Switch between siblings at same level
 * - CRUD operations (create, edit, delete)
 */
export function WorkspaceSwitcherStack({
  onWorkspaceSelect,
  onCreateWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  onPersonalizeWorkspace,
  isLoading = false,
}: WorkspaceSwitcherStackProps) {
  const router = useRouter()
  const { isMobile } = useSidebar()

  const {
    workspaceId,
    setWorkspaceId,
    workspaces,
    currentWorkspace,
    mainWorkspace,
    isMainWorkspace,
    childWorkspaces,
    siblingWorkspaces,
    workspacePath,
    isGuestMode,
  } = useUnifiedWorkspaceContext()

  const handleWorkspaceSelect = React.useCallback(
    (wsId: Id<"workspaces">) => {
      setWorkspaceId(wsId)
      onWorkspaceSelect?.(wsId)
    },
    [setWorkspaceId, onWorkspaceSelect],
  )

  if (isLoading || !workspaces) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled className="opacity-75">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Build the stack levels from workspace path
  // Each level shows: parent path item at that depth
  // The last level is the current workspace
  const stackLevels = workspacePath.map((ws, index) => ({
    workspace: ws,
    isActive: index === workspacePath.length - 1,
    depth: index,
  }))

  // Always show child placeholder if current workspace has children
  // This allows immediate selection without clicking parent dropdown first
  const showChildPlaceholder = childWorkspaces && childWorkspaces.length > 0

  // Helper to get siblings for a workspace in guest mode
  const getGuestSiblings = (ws: any) => {
    if (!isGuestMode || !workspaces) return []
    if (ws.parentWorkspaceId) {
      return workspaces.filter((w: any) => w.parentWorkspaceId === ws.parentWorkspaceId && w._id !== ws._id)
    }
    return workspaces.filter((w: any) => !w.parentWorkspaceId && w._id !== ws._id)
  }

  // Helper to get children for a workspace in guest mode
  const getGuestChildren = (ws: any) => {
    if (!isGuestMode || !workspaces) return []
    return workspaces.filter((w: any) => w.parentWorkspaceId === ws._id)
  }

  return (
    <div className="space-y-1">
      {stackLevels.map((level, index) => (
        <WorkspaceLevelSwitcher
          key={level.workspace._id}
          workspace={level.workspace}
          depth={level.depth}
          isActive={level.isActive}
          currentWorkspaceId={workspaceId}
          onSelect={handleWorkspaceSelect}
          onCreateWorkspace={isGuestMode ? undefined : onCreateWorkspace}
          onEditWorkspace={isGuestMode ? undefined : onEditWorkspace}
          onDeleteWorkspace={isGuestMode ? undefined : onDeleteWorkspace}
          onPersonalizeWorkspace={isGuestMode ? undefined : onPersonalizeWorkspace || (() => router.push("/dashboard/settings?tab=workspace&category=appearance"))}
          isMobile={isMobile}
          isGuestMode={isGuestMode}
          guestSiblings={getGuestSiblings(level.workspace)}
          guestChildren={getGuestChildren(level.workspace)}
        />
      ))}

      {/* If no path, show just main/current */}
      {stackLevels.length === 0 && currentWorkspace && (
        <WorkspaceLevelSwitcher
          workspace={currentWorkspace}
          depth={0}
          isActive={true}
          currentWorkspaceId={workspaceId}
          onSelect={handleWorkspaceSelect}
          onCreateWorkspace={isGuestMode ? undefined : onCreateWorkspace}
          onEditWorkspace={isGuestMode ? undefined : onEditWorkspace}
          onDeleteWorkspace={isGuestMode ? undefined : onDeleteWorkspace}
          onPersonalizeWorkspace={isGuestMode ? undefined : onPersonalizeWorkspace || (() => router.push("/dashboard/settings?tab=workspace&category=appearance"))}
          isMobile={isMobile}
          isGuestMode={isGuestMode}
          guestSiblings={getGuestSiblings(currentWorkspace)}
          guestChildren={getGuestChildren(currentWorkspace)}
        />
      )}

      {/* Show child workspace selector when current workspace has children */}
      {showChildPlaceholder && currentWorkspace && (
        <ChildWorkspacePlaceholder
          parentWorkspace={currentWorkspace}
          children={childWorkspaces}
          onSelect={handleWorkspaceSelect}
          onCreateWorkspace={isGuestMode ? undefined : onCreateWorkspace}
          isMobile={isMobile}
        />
      )}

    </div>
  )
}

interface WorkspaceLevelSwitcherProps {
  workspace: Doc<"workspaces">
  depth: number
  isActive: boolean
  currentWorkspaceId: Id<"workspaces"> | null
  onSelect: (id: Id<"workspaces">) => void
  onCreateWorkspace?: (parentId?: Id<"workspaces">) => void
  onEditWorkspace?: (workspaceId: Id<"workspaces">) => void
  onDeleteWorkspace?: (workspaceId: Id<"workspaces">) => void
  onPersonalizeWorkspace?: (workspaceId: Id<"workspaces">) => void
  isMobile: boolean
  isGuestMode?: boolean
  guestSiblings?: any[]
  guestChildren?: any[]
}

function WorkspaceLevelSwitcher({
  workspace,
  depth,
  isActive,
  currentWorkspaceId,
  onSelect,
  onCreateWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  onPersonalizeWorkspace,
  isMobile,
  isGuestMode = false,
  guestSiblings = [],
  guestChildren = [],
}: WorkspaceLevelSwitcherProps) {
  // Fetch siblings for THIS workspace (not the current selected) - skip in guest mode
  const siblingsQuery = useQuery(
    // @ts-ignore — deep type recursion in Convex API refs
    api.workspace.hierarchy.getSiblingWorkspaces,
    isGuestMode ? "skip" : { workspaceId: workspace._id }
  )

  // Fetch children for THIS workspace (only if it's the active/current one) - skip in guest mode
  const childrenQuery = useQuery(
    api.workspace.hierarchy.getChildWorkspaces,
    isGuestMode ? "skip" : (isActive ? { workspaceId: workspace._id, includeLinked: true } : "skip")
  )

  // Use guest data if in guest mode, otherwise use query results
  const siblings = isGuestMode ? guestSiblings : siblingsQuery
  const children = isGuestMode ? guestChildren : childrenQuery

  const Icon = WORKSPACE_TYPE_ICONS[workspace.type ?? "personal"] ?? Briefcase
  const color = (workspace as any).color ?? DEFAULT_WORKSPACE_COLOR
  const isMainWorkspace = (workspace as any).isMainWorkspace

  const siblingsArray = siblings ?? []
  const childrenArray = children ?? []

  // Always use consistent sizing - only differentiate by color accent
  const hasCrudActions = isActive && (onCreateWorkspace || onEditWorkspace || onDeleteWorkspace)

  // Combined options: siblings + children + CRUD actions
  // Always show dropdown if there's any interaction available
  const hasOptions = siblingsArray.length > 0 || childrenArray.length > 0 || hasCrudActions

  // Is this workspace the currently selected one?
  const isCurrentSelection = String(workspace._id) === String(currentWorkspaceId)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              style={{
                borderLeftWidth: "3px",
                borderLeftColor: isActive ? color : "transparent",
                borderLeftStyle: "solid",
              }}
            >
              <WorkspaceIcon workspace={workspace} className="aspect-square size-8" />

              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-semibold">
                    {workspace.name}
                  </span>
                  {isMainWorkspace && (
                    <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                      <Crown className="h-2.5 w-2.5" />
                    </Badge>
                  )}
                </div>
                <span className="truncate text-xs text-muted-foreground">
                  {workspace.type}
                  {!isActive && " (parent)"}
                </span>
              </div>
              <ChevronDown className="ml-auto size-4 transition-transform" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {/* CRUD Actions for active workspace */}
            {hasCrudActions && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Actions
                </DropdownMenuLabel>
                {onCreateWorkspace && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault()
                      onCreateWorkspace(workspace._id)
                    }}
                  >
                    <Plus className="size-4" />
                    <span>Create Child Workspace</span>
                  </DropdownMenuItem>
                )}
                {onEditWorkspace && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault()
                      onEditWorkspace(workspace._id)
                    }}
                  >
                    <Pencil className="size-4" />
                    <span>Edit Workspace</span>
                  </DropdownMenuItem>
                )}
                {onPersonalizeWorkspace && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault()
                      onPersonalizeWorkspace(workspace._id)
                    }}
                  >
                    <Palette className="size-4" />
                    <span>Personalize Workspace</span>
                  </DropdownMenuItem>
                )}
                {onDeleteWorkspace && !isMainWorkspace && (
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                    onSelect={(e) => {
                      e.preventDefault()
                      onDeleteWorkspace(workspace._id)
                    }}
                  >
                    <Trash2 className="size-4" />
                    <span>Delete Workspace</span>
                  </DropdownMenuItem>
                )}
                {(siblingsArray.length > 0 || childrenArray.length > 0) && (
                  <DropdownMenuSeparator />
                )}
              </>
            )}

            {/* Siblings - always include current workspace */}
            {siblingsArray.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Same Level ({siblingsArray.length + 1})
                </DropdownMenuLabel>
                {/* Current workspace first */}
                <WorkspaceMenuItem
                  key={workspace._id}
                  workspace={workspace}
                  isSelected={isCurrentSelection}
                  onSelect={() => onSelect(workspace._id)}
                />
                {/* Then siblings */}
                {siblingsArray.map((sibling) => (
                  <WorkspaceMenuItem
                    key={sibling._id}
                    workspace={sibling}
                    isSelected={String(sibling._id) === String(currentWorkspaceId)}
                    onSelect={() => onSelect(sibling._id)}
                  />
                ))}
              </>
            )}

            {/* Children */}
            {childrenArray.length > 0 && (
              <>
                {siblingsArray.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Child Workspaces ({childrenArray.length})
                </DropdownMenuLabel>
                {childrenArray.map((child) => (
                  <WorkspaceMenuItem
                    key={child._id}
                    workspace={child}
                    isSelected={String(child._id) === String(currentWorkspaceId)}
                    onSelect={() => onSelect(child._id)}
                  />
                ))}
              </>
            )}

            {/* Empty state with create option */}
            {!hasCrudActions && siblingsArray.length === 0 && childrenArray.length === 0 && (
              <DropdownMenuItem disabled className="text-muted-foreground">
                No workspaces available
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function WorkspaceMenuItem({
  workspace,
  isSelected,
  onSelect,
}: {
  workspace: Doc<"workspaces">
  isSelected?: boolean
  onSelect: () => void
}) {
  const Icon = WORKSPACE_TYPE_ICONS[workspace.type ?? "personal"] ?? Briefcase
  const color = (workspace as any).color ?? DEFAULT_WORKSPACE_COLOR
  const isMain = (workspace as any).isMainWorkspace
  const isShared = (workspace as any).isShared

  return (
    <DropdownMenuItem
      className="gap-2 p-2 cursor-pointer"
      onSelect={(e) => {
        e.preventDefault()
        onSelect()
      }}
    >
      <WorkspaceIcon workspace={workspace} className="size-6 rounded-sm" iconClassName="size-3.5" size={24} />
      <div className="flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{workspace.name}</span>
          {isMain && (
            <Crown className="size-3 text-yellow-500" />
          )}
          {isShared && (
            <Badge variant="outline" className="h-4 px-1 text-[10px] gap-0.5">
              <Share2 className="size-2.5" />
              Shared
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {workspace.type}
        </span>
      </div>
      {isSelected && (
        <Check className="size-4 text-primary" />
      )}
    </DropdownMenuItem>
  )
}

/**
 * Placeholder component that appears when parent workspace has children
 * Allows user to immediately select a child workspace without clicking parent dropdown
 */
interface ChildWorkspacePlaceholderProps {
  parentWorkspace: Doc<"workspaces">
  children: Doc<"workspaces">[]
  onSelect: (id: Id<"workspaces">) => void
  onCreateWorkspace?: (parentId?: Id<"workspaces">) => void
  isMobile: boolean
}

// Helper component for workspace icon/logo
function WorkspaceIcon({
  workspace,
  className,
  iconClassName,
  size = 32,
}: {
  workspace: Doc<"workspaces">
  className?: string
  iconClassName?: string
  size?: number
}) {
  const Icon = WORKSPACE_TYPE_ICONS[workspace.type ?? "personal"] ?? Briefcase
  const color = (workspace as any).color ?? DEFAULT_WORKSPACE_COLOR
  const logoStorageId = (workspace as any).logoStorageId

  // Use query to get logo URL if storage ID exists
  const logoUrl = useQuery(api.workspace.storage.getWorkspaceLogoUrl,
    logoStorageId ? { workspaceId: workspace._id } : "skip"
  )

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={workspace.name}
        width={size}
        height={size}
        className={cn("object-cover rounded-md bg-transparent", className)}
      />
    )
  }

  return (
    <div
      className={cn("flex items-center justify-center rounded-lg text-white", className)}
      style={{ backgroundColor: color }}
    >
      <Icon className={cn("size-4", iconClassName)} />
    </div>
  )
}

function ChildWorkspacePlaceholder({
  parentWorkspace,
  children,
  onSelect,
  onCreateWorkspace,
  isMobile,
}: ChildWorkspacePlaceholderProps) {
  const parentColor = (parentWorkspace as any).color ?? DEFAULT_WORKSPACE_COLOR

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-dashed border-muted-foreground/30 bg-muted/30 hover:bg-muted/50"
              style={{
                borderLeftWidth: "3px",
                borderLeftColor: "transparent",
                borderLeftStyle: "solid",
              }}
            >
              <div
                className="flex aspect-square size-8 items-center justify-center rounded-lg border-2 border-dashed"
                style={{ borderColor: parentColor, color: parentColor }}
              >
                <ChevronDown className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-muted-foreground">
                  Select sub-workspace
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {children.length} available
                </span>
              </div>
              <ChevronDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {/* Create new child option */}
            {onCreateWorkspace && (
              <>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault()
                    onCreateWorkspace(parentWorkspace._id)
                  }}
                >
                  <Plus className="size-4" />
                  <span>Create New Sub-Workspace</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Sub-Workspaces ({children.length})
            </DropdownMenuLabel>
            {children.map((child) => (
              <WorkspaceMenuItem
                key={child._id}
                workspace={child}
                isSelected={false}
                onSelect={() => onSelect(child._id)}
              />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default WorkspaceSwitcherStack

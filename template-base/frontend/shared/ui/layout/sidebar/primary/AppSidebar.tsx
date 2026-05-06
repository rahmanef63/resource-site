"use client"

import * as React from "react"
import { useMemo } from "react"
import dynamic from "next/dynamic"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Building, BookOpen, Calendar } from "lucide-react"

import { WorkspaceSwitcherStack } from "../workspace-switcher/WorkspaceSwitcherStack"
import { WorkspaceSwitcher } from "../workspace-switcher/WorkspaceSwitcher"
import { NavMain } from "./NavMain"
import { NavPinned } from "./NavPinned"
import { usePathname, useRouter } from "next/navigation"
import { NavUser } from "./NavUser"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { NavSystem } from "./NavSystem"
import { NavSecondary } from "./NavSecondary"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import {
  useGuestWorkspaceContextOptional,
  GUEST_USER,
} from "@/frontend/shared/foundation/provider/GuestWorkspaceProvider"
import type { WorkspaceStoreItem, WorkspaceType } from "@/frontend/shared/workspace"

const CreateWorkspaceDialog = dynamic(
  () => import("@/frontend/shared/workspace").then((m) => m.CreateWorkspaceDialog),
  { ssr: false },
)
const EditWorkspaceDialog = dynamic(
  () => import("@/frontend/shared/workspace").then((m) => m.EditWorkspaceDialog),
  { ssr: false },
)
const DeleteWorkspaceDialog = dynamic(
  () => import("@/frontend/shared/workspace").then((m) => m.DeleteWorkspaceDialog),
  { ssr: false },
)

// Import extracted hooks
import {
  useWorkspaceCRUD,
  useNavItems,
  useMenuSeeding,
  useSystemNavItems
} from "./hooks"
import {
  getDashboardBaseForMode,
  getDashboardFeatureHref,
  getDashboardRouteInfo,
} from "@/frontend/shared/ui/layout/dashboard/dashboard-routes"

const CommandMenu = dynamic(
  () => import("@/frontend/shared/foundation/utils/system/command-menu").then((mod) => mod.CommandMenu),
  { ssr: false },
)

const GlobalOverlays = dynamic(
  () => import("../../chrome/GlobalOverlays").then((mod) => mod.GlobalOverlays),
  { ssr: false },
)

/**
 * Hook that works with both WorkspaceProvider (authenticated) and GuestWorkspaceProvider (guest mode)
 */
function useUnifiedWorkspaceContext() {
  const guestContext = useGuestWorkspaceContextOptional()
  const realContext = useWorkspaceContext()

  if (guestContext) {
    return {
      workspaceId: guestContext.workspaceId as Id<"workspaces"> | null,
      setWorkspaceId: (id: Id<"workspaces"> | null) => guestContext!.setWorkspaceId(id as string | null),
      currentWorkspace: guestContext.currentWorkspace as any,
      workspaces: guestContext.workspaces as any[],
      isGuestMode: true,
      guestUser: guestContext.guestUser,
    }
  }

  if (realContext) {
    return {
      workspaceId: realContext.workspaceId,
      setWorkspaceId: realContext.setWorkspaceId,
      currentWorkspace: realContext.currentWorkspace,
      workspaces: realContext.workspaces,
      isGuestMode: false,
      guestUser: null,
    }
  }

  // Fallback
  return {
    workspaceId: null as Id<"workspaces"> | null,
    setWorkspaceId: () => { },
    currentWorkspace: null as any,
    workspaces: undefined as any[] | undefined,
    isGuestMode: false,
    guestUser: null,
  }
}

export interface AppSidebarProps {
  workspaceId?: Id<"workspaces"> | null
  onWorkspaceChange?: (workspaceId: Id<"workspaces">) => void
  activeView?: string
  onViewChange?: (view: string) => void
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

export function AppSidebar({
  workspaceId,
  onWorkspaceChange,
  activeView,
  onViewChange = () => { },
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
}: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const {
    workspaceId: ctxWorkspaceId,
    setWorkspaceId,
    currentWorkspace: contextWorkspace,
    workspaces: contextWorkspaces,
    isGuestMode,
    guestUser
  } = useUnifiedWorkspaceContext()
  const routeBase = getDashboardBaseForMode(isGuestMode)

  // Derive active view from pathname
  const derivedActiveView = React.useMemo(() => {
    const routeInfo = getDashboardRouteInfo(pathname, routeBase)
    if (routeInfo.isHome) return "overview"
    return routeInfo.slug ?? "overview"
  }, [pathname, routeBase])

  const effectiveActiveView = activeView ?? derivedActiveView
  const handleViewChange = onViewChange ?? ((view: string) => router.push(getDashboardFeatureHref(routeBase, view)))
  const effectiveWorkspaceId = (workspaceId ?? ctxWorkspaceId) as Id<"workspaces"> | null

  // Query user workspaces - skip in guest mode
  const userWorkspacesQuery = useQuery(
    // @ts-ignore — deep type recursion in Convex API refs
    api.workspace.workspaces.getUserWorkspaces,
    isGuestMode ? "skip" : undefined
  )

  // Use context workspaces in guest mode, query result otherwise
  const userWorkspaces = isGuestMode ? contextWorkspaces : userWorkspacesQuery

  // Use extracted hooks for navigation and CRUD
  const { navItems, systemItems, menuItems } = useNavItems(effectiveWorkspaceId)
  const finalSystemItems = useSystemNavItems(systemItems)

  // Auto-seed menu items - skip in guest mode
  useMenuSeeding(isGuestMode ? null : effectiveWorkspaceId, menuItems)

  // Workspace CRUD hook
  const {
    createDialogOpen,
    setCreateDialogOpen,
    createParentId,
    openCreateDialog,
    handleCreateSubmit,
    editDialogOpen,
    setEditDialogOpen,
    editWorkspace,
    openEditDialog,
    handleEditSubmit,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteWorkspace,
    openDeleteDialog,
    handleDeleteConfirm,
  } = useWorkspaceCRUD()

  // Prepare dialog props to avoid complex expressions in JSX (must be before conditional returns)
  const createParentWorkspace = useMemo(() => {
    if (!createParentId || !userWorkspaces) return null
    const parent = userWorkspaces.find((ws: any) => ws._id === createParentId)
    return {
      id: createParentId as unknown as string,
      name: parent?.name || "Parent",
    } as WorkspaceStoreItem
  }, [createParentId, userWorkspaces])

  const editWorkspaceItem = useMemo(() => {
    if (!editWorkspace) return null
    return {
      id: editWorkspace._id as unknown as string,
      name: editWorkspace.name,
      description: editWorkspace.description,
      type: (editWorkspace.type || "group") as WorkspaceType,
      icon: (editWorkspace as any).icon,
      color: (editWorkspace as any).color,
    } as WorkspaceStoreItem
  }, [editWorkspace])

  const deleteWorkspaceItem = useMemo(() => {
    if (!deleteWorkspace) return null
    return {
      id: deleteWorkspace._id as unknown as string,
      name: deleteWorkspace.name,
    } as WorkspaceStoreItem
  }, [deleteWorkspace])

  if (userWorkspaces === undefined) {
    return (
      <>
        <Sidebar collapsible={collapsible} side={side} variant={variant}>
          <SidebarContent>
            <div className="text-muted-foreground mx-auto flex items-center justify-center p-4">Loading...</div>
          </SidebarContent>
        </Sidebar>
        <CommandMenu />
        <GlobalOverlays />
      </>
    )
  }

  type SwitcherItem = {
    id: Id<"workspaces">
    name: string
    logo: React.ElementType
    plan: string
  }

  const workspaces: SwitcherItem[] = (userWorkspaces as any[])
    .filter((ws: any) => ws && ws._id && ws.name)
    .map((ws: any) => ({
      id: ws._id as Id<"workspaces">,
      name: ws.name as string,
      logo: Building,
      plan: ws.type ? String(ws.type).charAt(0).toUpperCase() + String(ws.type).slice(1) : "Workspace",
    }))

  if (workspaces.length === 0) {
    return (
      <>
        <Sidebar collapsible={collapsible} side={side} variant={variant}>
          <SidebarHeader>
            <WorkspaceSwitcher
              workspaces={[]}
              currentWorkspace={undefined}
              onWorkspaceSelect={() => { }}
              isLoading={false}
            />
          </SidebarHeader>
          <SidebarContent>
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-8 rounded-md bg-muted/80 animate-pulse" />
              ))}
            </div>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-4 pb-4 text-xs text-muted-foreground">
              Create a workspace to see navigation and data.
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <CommandMenu />
        <GlobalOverlays />
      </>
    )
  }

  const currentWorkspace = workspaces.find((w: SwitcherItem) => String(w.id) === String(effectiveWorkspaceId || ""))

  const secondaryItems = [
    { title: "Support", url: "#", icon: BookOpen },
    { title: "Feedback", url: "#", icon: Calendar },
  ]

  return (
    <>
      <Sidebar collapsible={collapsible} side={side} variant={variant}>
        <SidebarHeader>
          <WorkspaceSwitcherStack
            onWorkspaceSelect={(wsId) => {
              if (onWorkspaceChange) {
                onWorkspaceChange(wsId)
              } else {
                setWorkspaceId(wsId)
              }
            }}
            onCreateWorkspace={isGuestMode ? undefined : openCreateDialog}
            onEditWorkspace={isGuestMode ? undefined : openEditDialog}
            onDeleteWorkspace={isGuestMode ? undefined : openDeleteDialog}
            isLoading={userWorkspaces === undefined}
          />
        </SidebarHeader>
        <SidebarContent className="flex justify-between">
          <div>
            {effectiveWorkspaceId ? (
              <>
                {!isGuestMode && <NavPinned workspaceId={effectiveWorkspaceId as Id<"workspaces">} />}
                <NavMain
                  workspaceId={effectiveWorkspaceId as Id<"workspaces">}
                  activeView={effectiveActiveView}
                  onViewChange={handleViewChange}
                  items={navItems}
                  workspaceColor={contextWorkspace?.color}
                />
              </>
            ) : (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-6 rounded bg-muted animate-pulse" />
                ))}
              </div>
            )}
            <NavSystem system={finalSystemItems} />
          </div>
          <NavSecondary />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
        <SidebarRail />

        {/* Workspace CRUD Dialogs - only show in authenticated mode */}
        {!isGuestMode && (
          <>
            <CreateWorkspaceDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              onSubmit={handleCreateSubmit}
              parentWorkspace={createParentWorkspace}
            />

            <EditWorkspaceDialog
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              workspace={editWorkspaceItem}
              onSubmit={handleEditSubmit}
            />

            <DeleteWorkspaceDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              workspace={deleteWorkspaceItem}
              onConfirm={handleDeleteConfirm}
            />
          </>
        )}
      </Sidebar>
      <CommandMenu />
      <GlobalOverlays />
    </>
  )
}

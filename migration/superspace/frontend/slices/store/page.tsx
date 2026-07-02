"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import type { Id } from "@/convex/_generated/dataModel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkspaceStorePage } from "./views/workspace/WorkspaceStorePage"
import MenuStorePage from "./views/menu/MenuStorePage"

type TabKey = "workspace" | "menu"

function StorePageInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { workspaceId } = useWorkspaceContext()

  const canManageMenus = useQuery(
    api.workspace.roles.hasPermission,
    workspaceId
      ? { workspaceId: workspaceId as Id<"workspaces">, permission: "manage_menus" }
      : "skip",
  )

  const rawTab = searchParams?.get("tab")
  const requestedTab: TabKey =
    rawTab === "menu" ? "menu" : "workspace"

  // Force workspace tab if user lacks menu permission but requested menu.
  const activeTab: TabKey =
    requestedTab === "menu" && !canManageMenus ? "workspace" : requestedTab

  const handleTabChange = React.useCallback(
    (value: string) => {
      const next = value === "menu" ? "menu" : "workspace"
      const params = new URLSearchParams(searchParams?.toString() ?? "")
      if (next === "workspace") {
        params.delete("tab")
      } else {
        params.set("tab", next)
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : (pathname ?? "/dashboard/store"))
    },
    [router, pathname, searchParams],
  )

  // No permission to manage menus → render WorkspaceStorePage standalone, no tab UI.
  if (canManageMenus === false) {
    return <WorkspaceStorePage />
  }

  // Permission still loading → render workspace as safe default without tabs.
  if (canManageMenus === undefined) {
    return <WorkspaceStorePage />
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex h-full min-h-0 flex-1 flex-col"
    >
      <div className="border-b bg-background px-4 pt-3">
        <TabsList>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent
        value="workspace"
        className="flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
        forceMount
      >
        <WorkspaceStorePage />
      </TabsContent>
      <TabsContent
        value="menu"
        className="flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
        forceMount
      >
        <MenuStorePage workspaceId={(workspaceId as Id<"workspaces"> | null) ?? null} />
      </TabsContent>
    </Tabs>
  )
}

export default function StorePage() {
  return (
    <React.Suspense fallback={null}>
      <StorePageInner />
    </React.Suspense>
  )
}

"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell/FeatureShell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Layers, Settings } from "lucide-react"
import { TreeTab } from "./TreeTab"
import { MenusTab } from "./MenusTab"
import { SettingsTab } from "./SettingsTab"
import { WorkspaceSwitcher } from "../components/WorkspaceSwitcher"
import type { Id } from "@/convex/_generated/dataModel"

interface WorkspaceShellEditorProps {
  workspaceId: Id<"workspaces">
}

type TabKey = "tree" | "menus" | "settings"

const VALID_TABS: TabKey[] = ["tree", "menus", "settings"]

function isValidTab(v: string | null): v is TabKey {
  return v !== null && (VALID_TABS as string[]).includes(v)
}

/**
 * WorkspaceShellEditor — main editor page with tabs (tree / menus / settings).
 *
 * URL routing: ?tab=<key>. Default = menus (most useful first).
 * Header renders the live switcher so the user can swap workspace/menuSet
 * context without leaving the editor.
 *
 * FeatureShell takes `children` only — it has no `tabs` prop (verified against
 * its exported FeatureShellProps). The tab bar is the shadcn `Tabs` primitive,
 * matching the pattern ReportsPage already uses.
 */
export function WorkspaceShellEditor({ workspaceId }: WorkspaceShellEditorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const activeTab: TabKey = isValidTab(tabParam) ? tabParam : "menus"

  const handleTabChange = React.useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", next)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  return (
    <FeatureShell featureId="workspace-shell" padding={false}>
      <div className="flex h-full flex-col">
        {/* Header KPI / switcher area above tab bar */}
        <div className="px-4 py-3 border-b bg-background">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-0.5">
              <h1 className="text-lg font-semibold">Workspace Shell</h1>
              <p className="text-xs text-muted-foreground">
                Manage navigation context, menu sets, and workspace tree.
              </p>
            </div>
            <WorkspaceSwitcher canFork={true} compact />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 space-y-4 p-4">
          <TabsList className="flex w-full max-w-md justify-evenly">
            <TabsTrigger value="menus">
              <Layers className="mr-2 size-4" aria-hidden="true" />
              Menus
            </TabsTrigger>
            <TabsTrigger value="tree">
              <Building2 className="mr-2 size-4" aria-hidden="true" />
              Workspace tree
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 size-4" aria-hidden="true" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menus" className="min-h-0">
            <MenusTab workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="tree" className="min-h-0">
            <TreeTab />
          </TabsContent>
          <TabsContent value="settings" className="min-h-0">
            <SettingsTab workspaceId={workspaceId} />
          </TabsContent>
        </Tabs>
      </div>
    </FeatureShell>
  )
}

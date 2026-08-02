"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { FeatureShell, type ShellTabItem } from "@/frontend/shared/ui/layout/feature-shell/FeatureShell"
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

  const tabs: ShellTabItem[] = React.useMemo(
    () => [
      {
        value: "menus",
        label: "Menus",
        icon: Layers,
        content: <MenusTab workspaceId={workspaceId} />,
      },
      {
        value: "tree",
        label: "Workspace tree",
        icon: Building2,
        content: <TreeTab />,
      },
      {
        value: "settings",
        label: "Settings",
        icon: Settings,
        content: <SettingsTab workspaceId={workspaceId} />,
      },
    ],
    [workspaceId],
  )

  return (
    <FeatureShell
      featureId="workspace-shell"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
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
    </FeatureShell>
  )
}

"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

import {
  DesktopDashboardShell,
  type DesktopDashboardShellProps,
} from "@/frontend/shared/ui/layout/dashboard/DesktopDashboardShell"
import { isWorkspaceOnboardingRoute } from "@/frontend/shared/ui/layout/dashboard/dashboard-routes"
import { MobileDashboardDock } from "@/frontend/shared/ui/layout/dashboard/mobile/MobileDashboardDock"
import { MobileProfileSheet } from "@/frontend/shared/ui/layout/dashboard/mobile/MobileProfileSheet"
import { MobileWorkspaceLauncher } from "@/frontend/shared/ui/layout/dashboard/mobile/MobileWorkspaceLauncher"
import { MobileTopBar } from "@/frontend/shared/ui/layout/dashboard/mobile/MobileTopBar"
import { useUnifiedMobileWorkspaceContext } from "@/frontend/shared/ui/layout/dashboard/mobile/useUnifiedMobileWorkspaceContext"
import { MobileChromeTitleProvider } from "@/frontend/shared/ui/layout/dashboard/mobile/mobile-chrome-title"

/**
 * Mobile shell starts as an additive layer on top of the stable desktop shell.
 * We reuse the existing providers and feature routing, then add mobile chrome
 * incrementally so rollout risk stays low.
 */
export function MobileDashboardShell(
  { children, ...props }: DesktopDashboardShellProps,
) {
  const pathname = usePathname()
  const [workspaceSwitcherOpen, setWorkspaceSwitcherOpen] = useState(false)
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)
  const {
    currentWorkspace,
    workspaces,
  } = useUnifiedMobileWorkspaceContext()
  const shouldHideMobileTopBar = isWorkspaceOnboardingRoute(pathname)

  return (
    <MobileChromeTitleProvider>
      <DesktopDashboardShell
        {...props}
        shellHeader={shouldHideMobileTopBar ? null : (
          <MobileTopBar
            onOpenLauncher={() => setWorkspaceSwitcherOpen(true)}
            currentWorkspaceName={currentWorkspace?.name}
            currentWorkspaceColor={currentWorkspace?.color}
            currentWorkspaceIcon={(currentWorkspace as any)?.icon}
            workspaceCount={workspaces.length}
          />
        )}
        contentClassName="@container/main relative flex flex-1 min-h-0 w-full overflow-hidden"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-24">
          {children}
        </div>
        <>
          <MobileDashboardDock
            currentWorkspaceColor={currentWorkspace?.color}
            onOpenProfile={() => setProfileSheetOpen(true)}
          />
          <MobileWorkspaceLauncher
            open={workspaceSwitcherOpen}
            onOpenChange={setWorkspaceSwitcherOpen}
            mode="workspace"
            currentWorkspaceColor={currentWorkspace?.color}
          />
          <MobileProfileSheet
            open={profileSheetOpen}
            onOpenChange={setProfileSheetOpen}
          />
        </>
      </DesktopDashboardShell>
    </MobileChromeTitleProvider>
  )
}

"use client"

import type React from "react"
import { Suspense } from "react"
import type { Id } from "@/convex/_generated/dataModel"

import { AppSidebar } from "@/frontend/shared/ui/layout/sidebar/primary/AppSidebar"
import { SiteHeader } from "@/frontend/shared/ui/layout/sidebar/components/site-header"
import { BreadcrumbsProvider } from "@/frontend/shared/ui/layout/sidebar/components/breadcrumbs-context"
import { LoadingBar } from "@/frontend/shared/ui/layout/sidebar/components/loading-bar"
import { OnboardingGuard } from "@/frontend/shared/ui/layout/sidebar/components/onboarding-guard"
import { useUnifiedWorkspaceContext } from "@/frontend/shared/foundation/provider/UnifiedWorkspaceContext"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { WorkspaceProvider } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { GuestWorkspaceProvider } from "@/frontend/shared/foundation/provider/GuestWorkspaceProvider"
import { useWorkspaceTheme } from "@/frontend/shared/theme"

export type DesktopDashboardShellMode = "authenticated" | "guest"

export interface DesktopDashboardShellProps {
  children: React.ReactNode
  mode: DesktopDashboardShellMode
  contentClassName?: string
  shellHeader?: React.ReactNode
}

function AuthenticatedWorkspaceThemeSync() {
  const { isGuestMode, workspaceId } = useUnifiedWorkspaceContext()

  useWorkspaceTheme({
    workspaceId: !isGuestMode && workspaceId
      ? workspaceId as Id<"workspaces">
      : null,
    autoApply: true,
  })

  return null
}

function ShellFrame({
  children,
  showOnboardingGuard,
  contentClassName,
  shellHeader,
}: {
  children: React.ReactNode
  showOnboardingGuard: boolean
  contentClassName?: string
  shellHeader?: React.ReactNode
}) {
  return (
    <>
      {showOnboardingGuard ? (
        <Suspense fallback={null}>
          <OnboardingGuard />
        </Suspense>
      ) : null}
      <AppSidebar />
      <SidebarInset className="flex h-screen flex-col overflow-hidden">
        <LoadingBar />
        {shellHeader ?? <SiteHeader />}
        <div className={contentClassName ?? "@container/main flex flex-1 min-h-0 w-full overflow-hidden"}>
          {children}
        </div>
      </SidebarInset>
    </>
  )
}

export function DesktopDashboardShell({
  children,
  mode,
  contentClassName,
  shellHeader,
}: DesktopDashboardShellProps) {
  const showOnboardingGuard = mode === "authenticated"

  const shellContent = (
    <ShellFrame
      showOnboardingGuard={showOnboardingGuard}
      contentClassName={contentClassName}
      shellHeader={shellHeader}
    >
      {children}
    </ShellFrame>
  )

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
      className="group/layout"
    >
      <BreadcrumbsProvider>
        {mode === "authenticated" ? (
          <WorkspaceProvider>
            <AuthenticatedWorkspaceThemeSync />
            {shellContent}
          </WorkspaceProvider>
        ) : (
          <GuestWorkspaceProvider>{shellContent}</GuestWorkspaceProvider>
        )}
      </BreadcrumbsProvider>
    </SidebarProvider>
  )
}

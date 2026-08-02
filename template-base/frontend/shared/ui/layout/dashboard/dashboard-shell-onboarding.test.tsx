/**
 * @vitest-environment jsdom
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  DesktopDashboardShell,
  type DesktopDashboardShellProps,
} from "./DesktopDashboardShell"
import { MobileDashboardShell } from "./MobileDashboardShell"

let mockPathname = "/dashboard/overview"

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}))

vi.mock("@/frontend/shared/ui/layout/sidebar/primary/AppSidebar", () => ({
  AppSidebar: () => <div data-testid="app-sidebar">Sidebar</div>,
}))

vi.mock("@/frontend/shared/ui/layout/sidebar/components/site-header", () => ({
  SiteHeader: () => <div data-testid="site-header">Header</div>,
}))

vi.mock("@/frontend/shared/ui/layout/sidebar/components/breadcrumbs-context", () => ({
  BreadcrumbsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("@/frontend/shared/ui/layout/sidebar/components/loading-bar", () => ({
  LoadingBar: () => <div data-testid="loading-bar">Loading</div>,
}))

vi.mock("@/frontend/shared/ui/layout/sidebar/components/onboarding-guard", () => ({
  OnboardingGuard: () => <div data-testid="onboarding-guard">Guard</div>,
}))

vi.mock("@/frontend/shared/foundation/provider/UnifiedWorkspaceContext", () => ({
  useUnifiedWorkspaceContext: () => ({
    isGuestMode: false,
    workspaceId: "ws_123",
  }),
}))

vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarInset: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <main data-testid="sidebar-inset" className={className}>
      {children}
    </main>
  ),
}))

vi.mock("@/frontend/shared/foundation/provider/WorkspaceProvider", () => ({
  WorkspaceProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("@/frontend/shared/foundation/provider/GuestWorkspaceProvider", () => ({
  GuestWorkspaceProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("@/frontend/shared/theme", () => ({
  useWorkspaceTheme: () => undefined,
}))

vi.mock("@/frontend/shared/ui/layout/dashboard/mobile/MobileTopBar", () => ({
  MobileTopBar: () => <div data-testid="mobile-top-bar">Mobile Top Bar</div>,
}))

vi.mock("@/frontend/shared/ui/layout/dashboard/mobile/MobileDashboardDock", () => ({
  MobileDashboardDock: () => <div data-testid="mobile-dock">Mobile Dock</div>,
}))

vi.mock("@/frontend/shared/ui/layout/dashboard/mobile/MobileWorkspaceLauncher", () => ({
  MobileWorkspaceLauncher: () => <div data-testid="mobile-launcher">Mobile Launcher</div>,
}))

vi.mock("@/frontend/shared/ui/layout/dashboard/mobile/MobileProfileSheet", () => ({
  MobileProfileSheet: () => <div data-testid="mobile-profile-sheet">Mobile Profile</div>,
}))

vi.mock("@/frontend/shared/ui/layout/dashboard/mobile/useUnifiedMobileWorkspaceContext", () => ({
  useUnifiedMobileWorkspaceContext: () => ({
    currentWorkspace: { name: "Warehouse", color: "#2563eb" },
    workspaces: [{ _id: "ws_1", name: "Warehouse", color: "#2563eb" }],
  }),
}))

vi.mock("@/frontend/shared/ui/layout/dashboard/mobile/mobile-chrome-title", () => ({
  MobileChromeTitleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function renderDesktopShell(props?: Partial<DesktopDashboardShellProps>) {
  return render(
    <DesktopDashboardShell mode="authenticated" {...props}>
      <div>Shell content</div>
    </DesktopDashboardShell>,
  )
}

describe("dashboard onboarding shell", () => {
  beforeEach(() => {
    mockPathname = "/dashboard/overview"
  })

  it("keeps desktop chrome visible on normal dashboard routes", () => {
    renderDesktopShell()

    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument()
    expect(screen.getByTestId("site-header")).toBeInTheDocument()
    expect(screen.getByTestId("onboarding-guard")).toBeInTheDocument()
    expect(screen.getByText("Shell content")).toBeInTheDocument()
  })

  it("keeps desktop chrome visible on the workspace onboarding route", () => {
    mockPathname = "/dashboard/workspace"

    renderDesktopShell()

    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument()
    expect(screen.getByTestId("site-header")).toBeInTheDocument()
    expect(screen.getByTestId("onboarding-guard")).toBeInTheDocument()
    expect(screen.getByText("Shell content")).toBeInTheDocument()
  })

  it("hides the mobile top bar on the workspace onboarding route", () => {
    mockPathname = "/dashboard/workspace"

    render(
      <MobileDashboardShell mode="authenticated">
        <div>Mobile onboarding</div>
      </MobileDashboardShell>,
    )

    expect(screen.queryByTestId("mobile-top-bar")).not.toBeInTheDocument()
    expect(screen.getByTestId("mobile-dock")).toBeInTheDocument()
    expect(screen.getByTestId("mobile-launcher")).toBeInTheDocument()
    expect(screen.getByTestId("mobile-profile-sheet")).toBeInTheDocument()
    expect(screen.getByText("Mobile onboarding")).toBeInTheDocument()
  })

  it("keeps mobile chrome overlays on other dashboard routes", () => {
    render(
      <MobileDashboardShell mode="authenticated">
        <div>Mobile dashboard</div>
      </MobileDashboardShell>,
    )

    expect(screen.getByTestId("mobile-top-bar")).toBeInTheDocument()
    expect(screen.getByTestId("mobile-dock")).toBeInTheDocument()
    expect(screen.getByTestId("mobile-launcher")).toBeInTheDocument()
    expect(screen.getByTestId("mobile-profile-sheet")).toBeInTheDocument()
    expect(screen.getByText("Mobile dashboard")).toBeInTheDocument()
  })
})

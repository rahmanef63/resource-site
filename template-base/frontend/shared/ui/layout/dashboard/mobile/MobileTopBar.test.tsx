/**
 * @vitest-environment jsdom
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { MobileTopBar } from "./MobileTopBar"

let mockPathname = "/dashboard/home"
let mockHasContentHeader = false
let mockAuthState = {
  isLoaded: true,
  isSignedIn: true,
}

function getMockSlug(pathname: string) {
  const [, base, slug] = pathname.split("?")[0].split("#")[0].split("/")

  if ((base !== "dashboard" && base !== "mock-dashboard") || !slug) {
    return null
  }

  if (slug === "home" || slug === "overview" || slug === "workspace" || slug === "workspace-store") {
    return null
  }

  return slug
}

function formatTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}))

vi.mock("@/frontend/shared/foundation/auth", () => ({
  useAuth: () => mockAuthState,
}))

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  } & Record<string, unknown>) => <a href={href} {...props}>{children}</a>,
}))

vi.mock("@/components/logo", () => ({
  BRAND_NAME: "SuperSpace",
  BrandLockup: ({ label }: { label: string }) => <span>{label}</span>,
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode
  } & Record<string, unknown>) => <button {...props}>{children}</button>,
}))

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/frontend/shared/ui/layout/header", () => ({
  getActiveFeatureSlug: (pathname: string) => getMockSlug(pathname),
  getPageTitle: (pathname: string) => {
    const slug = getMockSlug(pathname)
    return slug ? formatTitle(slug) : "Overview"
  },
  slugToDisplayName: (slug: string) => formatTitle(slug),
}))

vi.mock("@/frontend/shared/ui/layout/dashboard/mobile/mobile-chrome-title", () => ({
  useHasMobileContentHeader: () => mockHasContentHeader,
}))

vi.mock("@/frontend/shared/ui/layout/sidebar/components/guest-marketing-header", () => ({
  isMarketingHeaderRoute: () => false,
  MarketingMobileMenuButton: () => <button>Menu</button>,
  MarketingThemeToggle: () => <button>Theme</button>,
}))

vi.mock("@/frontend/shared/ui/icons/dynamic-icon", () => ({
  getIconComponent: () => null,
}))

describe("MobileTopBar", () => {
  beforeEach(() => {
    mockPathname = "/dashboard/home"
    mockHasContentHeader = false
    mockAuthState = {
      isLoaded: true,
      isSignedIn: true,
    }
  })

  it("keeps Home as the heading on the mobile home route", () => {
    render(
      <MobileTopBar
        currentWorkspaceName="Acme Space"
        workspaceCount={3}
      />,
    )

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Acme Space" })).not.toBeInTheDocument()
    expect(screen.getAllByText("Acme Space")).toHaveLength(2)
  })

  it("hides the title strip when the page renders its own mobile content header", () => {
    mockHasContentHeader = true

    render(
      <MobileTopBar
        currentWorkspaceName="Acme Space"
        workspaceCount={3}
      />,
    )

    expect(screen.queryByRole("heading", { name: "Home" })).not.toBeInTheDocument()
  })
})

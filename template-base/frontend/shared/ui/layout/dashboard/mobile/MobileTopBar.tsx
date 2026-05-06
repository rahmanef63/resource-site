"use client"

import { useMemo } from "react"
import { BriefcaseBusiness, ChevronDown, Search, Settings } from "lucide-react"
import { useAuth } from "@/frontend/shared/foundation/auth"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { BRAND_NAME, BrandLockup } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  getActiveFeatureSlug,
  getPageTitle,
  slugToDisplayName,
} from "@/frontend/shared/ui/layout/header"
import { getDashboardRouteInfo } from "@/frontend/shared/ui/layout/dashboard/dashboard-routes"
import { useHasMobileContentHeader } from "@/frontend/shared/ui/layout/dashboard/mobile/mobile-chrome-title"
import {
  isMarketingHeaderRoute,
  MarketingMobileMenuButton,
  MarketingThemeToggle,
} from "@/frontend/shared/ui/layout/sidebar/components/guest-marketing-header"
import { getIconComponent } from "@/frontend/shared/ui/icons/dynamic-icon"

function getMobilePageTitle(pathname: string) {
  const routeInfo = getDashboardRouteInfo(pathname)

  if (pathname === "/dashboard/workspace") {
    return "Workspace"
  }

  if (pathname === "/dashboard/workspace-store") {
    return "Workspace Store"
  }

  if (routeInfo.isHome) {
    return "Home"
  }

  const activeFeatureSlug = getActiveFeatureSlug(pathname)
  if (activeFeatureSlug) {
    return slugToDisplayName(activeFeatureSlug)
  }

  if (routeInfo.base && routeInfo.isOverview) {
    return "Overview"
  }

  return getPageTitle(pathname)
}

export interface MobileTopBarProps {
  onOpenLauncher?: () => void
  currentWorkspaceName?: string
  currentWorkspaceColor?: string
  currentWorkspaceIcon?: string
  workspaceCount?: number
}

export function MobileTopBar({
  onOpenLauncher,
  currentWorkspaceName,
  currentWorkspaceColor,
  currentWorkspaceIcon,
  workspaceCount = 0,
}: MobileTopBarProps) {
  const pathname = usePathname() ?? ""
  const { isLoaded, isSignedIn } = useAuth()
  const hasContentHeader = useHasMobileContentHeader()
  const routeInfo = useMemo(() => getDashboardRouteInfo(pathname), [pathname])
  const activeFeatureSlug = useMemo(
    () => (routeInfo.isHome ? null : getActiveFeatureSlug(pathname)),
    [pathname, routeInfo.isHome],
  )
  const pageTitle = useMemo(() => getMobilePageTitle(pathname), [pathname])
  const subtitle = routeInfo.isHome
    ? (currentWorkspaceName ?? BRAND_NAME)
    : (activeFeatureSlug ? pageTitle : BRAND_NAME)
  const canSwitchWorkspace = workspaceCount > 1
  const shouldShowTitleStrip = !hasContentHeader
  // Resolve workspace icon — fallback to BriefcaseBusiness
  const WorkspaceIconComp = useMemo(
    () => (currentWorkspaceIcon ? (getIconComponent(currentWorkspaceIcon) ?? BriefcaseBusiness) : BriefcaseBusiness),
    [currentWorkspaceIcon],
  )
  const showMarketingHeader = isLoaded && !isSignedIn && isMarketingHeaderRoute(pathname)

  if (showMarketingHeader) {
    return (
      <div className="safe-area-top shrink-0 border-b border-border/60 bg-background/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="min-w-0 text-foreground">
            <BrandLockup
              label={BRAND_NAME}
              className="max-w-full"
              logoClassName="size-5"
              labelClassName="truncate text-base font-semibold"
            />
          </Link>

          <div className="flex items-center gap-1">
            <MarketingThemeToggle className="h-10 w-10 rounded-xl" />
            <MarketingMobileMenuButton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="safe-area-top shrink-0 border-b border-border/60 bg-background/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-11 min-w-0 flex-1 justify-between rounded-xl border-border/60 bg-background px-3 shadow-sm"
            onClick={onOpenLauncher}
            title="Switch workspace"
            style={
              currentWorkspaceColor
                ? {
                    boxShadow: `inset 0 0 0 1px ${currentWorkspaceColor}22`,
                    borderColor: `${currentWorkspaceColor}33`,
                  }
                : undefined
            }
          >
            <div className="min-w-0 text-left pt-0.5">
              <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Ganti Workspace
              </p>
              <div className="flex items-center gap-1.5">
                <WorkspaceIconComp
                  className="h-4 w-4 shrink-0"
                  style={currentWorkspaceColor ? { color: currentWorkspaceColor } : undefined}
                />
                <span className="truncate text-sm font-semibold text-foreground">
                  {currentWorkspaceName ?? BRAND_NAME}
                </span>
                {canSwitchWorkspace ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : null}
              </div>
            </div>
          </Button>
          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                  onClick={() => window.dispatchEvent(new Event("open-command-menu"))}
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Search (⌘K)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("open-settings", {
                        detail: activeFeatureSlug
                          ? { tab: "features", featureSlug: activeFeatureSlug }
                          : { tab: "workspace" },
                      }),
                    )
                  }
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Open settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {activeFeatureSlug ? `${pageTitle} settings` : "Workspace settings"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {shouldShowTitleStrip ? (
          <div className="px-1">
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {subtitle}
            </p>
            <h1
              className={routeInfo.isHome
                ? "truncate text-2xl font-bold tracking-tight text-foreground"
                : "truncate text-lg font-semibold text-foreground"}
            >
              {pageTitle}
            </h1>
          </div>
        ) : null}
      </div>
    </div>
  )
}

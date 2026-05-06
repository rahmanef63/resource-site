"use client"

import React, { useMemo } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Search, Settings } from "lucide-react"
import { useAuth } from "@/frontend/shared/foundation/auth"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useBreadcrumbs } from "./breadcrumbs-context"
import { Header, getActiveFeatureSlug, getPageTitle, slugToDisplayName } from "../../header"
import {
  useIsFeaturePanelMounted,
  useRightPanelStore,
} from "@/frontend/shared/ui/layout/feature-shell/rightPanelStore"
import {
  isMarketingHeaderRoute,
  MarketingDesktopHeaderNav,
  MarketingMobileMenuButton,
  MarketingThemeToggle,
} from "./guest-marketing-header"

const FeatureActionMenu = dynamic(
  () => import("@/frontend/shared/actions").then((mod) => mod.FeatureActionMenu),
  { ssr: false },
)

const FeatureExportImport = dynamic(
  () => import("@/frontend/shared/foundation/utils/data/shared/components/FeatureExportImport").then((mod) => mod.FeatureExportImport),
  { ssr: false },
)

const FeatureAIAssistant = dynamic(
  () => import("@/frontend/shared/ui/ai-assistant/FeatureAIAssistant").then((mod) => mod.FeatureAIAssistant),
  { ssr: false },
)

export function SiteHeader() {
  const pathname = usePathname() ?? ""
  const pageTitle = getPageTitle(pathname)
  const { breadcrumbs } = useBreadcrumbs()
  const { isLoaded, isSignedIn } = useAuth()
  const showMarketingHeader = isLoaded && !isSignedIn && isMarketingHeaderRoute(pathname)

  // Get active feature slug for dynamic buttons
  const activeFeatureSlug = useMemo(() => getActiveFeatureSlug(pathname), [pathname])
  const activeFeatureLabel = useMemo(
    () => (activeFeatureSlug ? slugToDisplayName(activeFeatureSlug) : null),
    [activeFeatureSlug],
  )

  // When a FeatureShell is mounted for the active feature, header buttons
  // dispatch into the right-panel store (open inspector + select tab).
  // Otherwise they fall back to the standalone overlays from GlobalOverlays.
  const isPanelMounted = useIsFeaturePanelMounted(activeFeatureSlug)
  const openTab = useRightPanelStore((s) => s.openTab)

  return (
    <Header
      className="h-(--header-height) shrink-0 gap-2 overflow-hidden transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
      // Use size="md" (px-4 py-3) but override padding to match original (px-4 lg:px-6)
      // Original had padding on inner div. Header puts it on root.
      // We'll use custom padding classes to match exactly.
      size="md"
    >
      {/* Left side: Sidebar trigger + Breadcrumbs */}
      <div className="flex flex-1 items-center gap-1 min-w-0 overflow-hidden lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {showMarketingHeader ? (
          <MarketingDesktopHeaderNav />
        ) : (
          <>
            {breadcrumbs.length > 0 ? (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => (
                    <React.Fragment key={item.href}>
                      <BreadcrumbItem>
                        {index < breadcrumbs.length - 1 ? (
                          <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            ) : (
              <h1 className="text-base font-medium truncate">{pageTitle}</h1>
            )}
          </>
        )}
      </div>

      {/* Right side: Notifications + Feature Settings */}
      <Header.Actions className="gap-1">
        {/* Search (inline desktop; icon→modal on mobile) */}
        <Button
          variant="outline"
          className="hidden h-8 max-w-[180px] justify-start gap-2 px-2 text-muted-foreground lg:inline-flex"
          onClick={() => window.dispatchEvent(new Event("open-command-menu"))}
        >
          <Search className="h-4 w-4" />
          <span className="inline-flex text-xs">Search...</span>
          <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground lg:hidden"
          onClick={() => window.dispatchEvent(new Event("open-command-menu"))}
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>

        {showMarketingHeader ? (
          <>
            <MarketingThemeToggle className="h-8 w-8 text-muted-foreground hover:text-foreground" />
            <div className="hidden items-center gap-2 lg:flex">
              <Button variant="ghost" size="sm" asChild className="h-8 px-3">
                <Link href="/sign-in">
                  Sign in
                </Link>
              </Button>
              <Button size="sm" asChild className="h-8 px-3">
                <Link href="/sign-up">
                  Sign up
                </Link>
              </Button>
            </div>
            <MarketingMobileMenuButton className="h-8 w-8 text-muted-foreground hover:text-foreground lg:hidden" />
          </>
        ) : (
          <>
            {isLoaded && !isSignedIn ? (
              <div className="hidden items-center gap-2 lg:flex">
                <Button variant="ghost" size="sm" asChild className="h-8 px-3">
                  <Link href="/sign-in">
                    Sign in
                  </Link>
                </Button>
                <Button size="sm" asChild className="h-8 px-3">
                  <Link href="/sign-up">
                    Sign up
                  </Link>
                </Button>
              </div>
            ) : isSignedIn ? (
              <>
                {/* Notifications button — store trigger when feature panel mounted, else overlay */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    if (isPanelMounted && activeFeatureSlug) {
                      openTab(activeFeatureSlug, "notifications")
                    } else {
                      window.dispatchEvent(new Event("open-notifications"))
                    }
                  }}
                >
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                </Button>

                {/* Settings button — store trigger when feature panel mounted, else overlay */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title={activeFeatureLabel ? `${activeFeatureLabel} Settings` : "Settings"}
                  onClick={() => {
                    if (isPanelMounted && activeFeatureSlug) {
                      openTab(activeFeatureSlug, "settings")
                    } else {
                      window.dispatchEvent(
                        new CustomEvent("open-settings", {
                          detail: activeFeatureSlug
                            ? { tab: "features", featureSlug: activeFeatureSlug }
                            : { tab: "workspace" },
                        })
                      )
                    }
                  }}
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">
                    {activeFeatureLabel ? `${activeFeatureLabel} Settings` : "Settings"}
                  </span>
                </Button>

                {/* AI Agent button — shown when on a feature page */}
                {activeFeatureSlug && (
                  <FeatureAIAssistant
                    featureId={activeFeatureSlug}
                    mode="dialog"
                    buttonVariant="ghost"
                    buttonSize="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    showLabel={false}
                  />
                )}

                {activeFeatureSlug && (
                  <>
                    {/* Data button (Import/Export) */}
                    <FeatureExportImport
                      featureId={activeFeatureSlug}
                      variant="dropdown"
                      buttonVariant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    />

                    {/* Actions button (burger/•••) */}
                    <FeatureActionMenu
                      featureSlug={activeFeatureSlug}
                      className="text-muted-foreground hover:text-foreground"
                    />
                  </>
                )}
              </>
            ) : null}
          </>
        )}
      </Header.Actions>
    </Header>
  )
}

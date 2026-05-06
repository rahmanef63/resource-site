"use client"

import { useCallback, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Check, ChevronRight, Search, Sparkles, Plus } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"

import { Accordion } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useNavItems } from "@/frontend/shared/ui/layout/sidebar/primary/hooks/useNavItems"
import type { SystemNavItem } from "@/frontend/shared/ui/layout/sidebar/primary/hooks/useSystemNavItems"
import { useUnifiedMobileWorkspaceContext } from "@/frontend/shared/ui/layout/dashboard/mobile/useUnifiedMobileWorkspaceContext"
import { useThemeConfig } from "@/frontend/shared/theme"
import { formatThemeLabel } from "@/frontend/shared/theme/utils/format-theme-label"
import { WorkspaceIcon } from "@/frontend/shared/ui/layout/sidebar/workspace-switcher/WorkspaceIcon"
import {
  getDashboardBaseForMode,
  getDashboardFeatureHref,
} from "@/frontend/shared/ui/layout/dashboard/dashboard-routes"

type LauncherTile = {
  id: string
  title: string
  description?: string
  icon: React.ElementType
  href: string
}

function getWorkspaceTrail(
  workspace: {
    _id: Id<"workspaces"> | string
    parentWorkspaceId?: Id<"workspaces"> | string | null
    name: string
  },
  workspaceLookup: Map<string, {
    _id: Id<"workspaces"> | string
    parentWorkspaceId?: Id<"workspaces"> | string | null
    name: string
  }>,
) {
  const trail: string[] = []
  let cursor = workspace.parentWorkspaceId ? workspaceLookup.get(String(workspace.parentWorkspaceId)) : null
  const seen = new Set<string>()

  while (cursor && !seen.has(String(cursor._id))) {
    seen.add(String(cursor._id))
    trail.unshift(cursor.name)
    cursor = cursor.parentWorkspaceId
      ? workspaceLookup.get(String(cursor.parentWorkspaceId)) ?? null
      : null
  }

  return trail.join(" / ")
}

function LauncherTileGrid({
  tiles,
  pathname,
  onNavigate,
  compact = false,
}: {
  tiles: LauncherTile[]
  pathname: string
  onNavigate: (href: string) => void
  compact?: boolean
}) {
  if (tiles.length === 0) {
    return null
  }

  return (
    <div className={cn("grid grid-cols-4 gap-x-3 gap-y-6", compact && "gap-y-5")}>
      {tiles.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <button
            key={item.id}
            type="button"
            className="flex flex-col items-center gap-2 text-center"
            onClick={() => onNavigate(item.href)}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-[1.4rem] border border-border/60 bg-background/90 shadow-lg transition-transform",
                compact ? "h-14 w-14" : "h-16 w-16",
                isActive && "border-primary/40 bg-primary/5",
              )}
            >
              <Icon className={cn(compact ? "h-5 w-5" : "h-7 w-7")} />
            </div>
            <div className="space-y-0.5">
              <p className={cn("line-clamp-2 font-semibold leading-tight", compact ? "text-[10px]" : "text-[11px]")}>
                {item.title}
              </p>
              {!compact && item.description ? (
                <p className="line-clamp-1 text-[9px] text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function LauncherSystemList({
  items,
  pathname,
  onNavigate,
}: {
  items: SystemNavItem[]
  pathname: string
  onNavigate: (href: string) => void
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="grid gap-2">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)

        return (
          <Button
            key={item.id}
            variant={isActive ? "secondary" : "ghost"}
            className="h-auto justify-between rounded-xl border border-border/60 px-4 py-3"
            onClick={() => onNavigate(item.url)}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 text-left">
                <div className="truncate text-sm font-medium">{item.name}</div>
                {item.description ? (
                  <div className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </div>
                ) : null}
              </div>
            </div>
          </Button>
        )
      })}
    </div>
  )
}

interface MobileWorkspaceLauncherProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "workspace" | "apps"
  onRequestWorkspaceSwitcher?: () => void
  currentWorkspaceColor?: string
}

export function MobileWorkspaceLauncher({
  open,
  onOpenChange,
  mode = "apps",
  onRequestWorkspaceSwitcher,
  currentWorkspaceColor,
}: MobileWorkspaceLauncherProps) {
  const pathname = usePathname() ?? ""
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const {
    isGuestMode,
    workspaceId,
    setWorkspaceId,
    currentWorkspace,
    workspaces,
    workspacePath,
  } = useUnifiedMobileWorkspaceContext()
  const { activeTheme } = useThemeConfig()
  const { navItems, systemItems } = useNavItems(workspaceId)
  const routeBase = getDashboardBaseForMode(isGuestMode)

  const searchTerm = searchQuery.trim().toLowerCase()

  const workspaceLookup = useMemo(
    () => new Map(workspaces.map((workspace) => [String(workspace._id), workspace])),
    [workspaces],
  )

  const rootTiles = useMemo<LauncherTile[]>(
    () =>
      navItems
        .filter((item) => !item.isGroup && item.id !== "overview" && item.id !== "ai")
        .map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          icon: item.icon,
          href: getDashboardFeatureHref(routeBase, item.id),
        })),
    [navItems, routeBase],
  )

  const groupedSections = useMemo(
    () =>
      navItems
        .filter((item) => item.isGroup && item.children.length > 0)
        .map((group) => ({
          id: group.id,
          title: group.title,
          tiles: group.children
            .filter((child) => child.id !== "overview" && child.id !== "ai")
            .map((child) => ({
              id: child.id,
              title: child.title,
              description: typeof child.metadata?.description === "string"
                ? child.metadata.description
                : undefined,
              icon: group.icon,
              href: getDashboardFeatureHref(routeBase, child.id),
            })),
        })),
    [navItems, routeBase],
  )

  const filteredRootTiles = useMemo(
    () =>
      searchTerm
        ? rootTiles.filter((item) =>
            [item.title, item.description, item.id]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(searchTerm)),
          )
        : rootTiles,
    [rootTiles, searchTerm],
  )

  const filteredGroupedSections = useMemo(
    () =>
      groupedSections
        .map((section) => ({
          ...section,
          tiles: searchTerm
            ? section.tiles.filter((tile) =>
                [tile.title, tile.description, tile.id, section.title]
                  .filter(Boolean)
                  .some((value) => String(value).toLowerCase().includes(searchTerm)),
              )
            : section.tiles,
        }))
        .filter((section) => section.tiles.length > 0),
    [groupedSections, searchTerm],
  )

  const filteredSystemItems = useMemo(
    () =>
      searchTerm
        ? systemItems.filter((item) =>
            [item.name, item.description, item.id]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(searchTerm)),
          )
        : systemItems,
    [searchTerm, systemItems],
  )

  const handleNavigate = useCallback((href: string) => {
    router.push(href)
    onOpenChange(false)
  }, [onOpenChange, router])

  const isWorkspaceMode = mode === "workspace"

  const quickAccessTiles = useMemo(
    () => filteredRootTiles.slice(0, 4),
    [filteredRootTiles],
  )

  const overflowRootTiles = useMemo(
    () => filteredRootTiles.slice(4),
    [filteredRootTiles],
  )

  const accordionItems = useMemo(() => {
    if (isWorkspaceMode) {
      return []
    }

    const items = []

    if (overflowRootTiles.length > 0) {
      items.push({
        value: "all-apps",
        title: (
          <div className="flex items-center justify-between gap-3">
            <span>More Apps</span>
            <span className="text-xs text-muted-foreground">{overflowRootTiles.length}</span>
          </div>
        ),
        content: (
          <LauncherTileGrid
            tiles={overflowRootTiles}
            pathname={pathname}
            onNavigate={handleNavigate}
            compact
          />
        ),
      })
    }

    for (const section of filteredGroupedSections) {
      items.push({
        value: section.id,
        title: (
          <div className="flex items-center justify-between gap-3">
            <span>{section.title}</span>
            <span className="text-xs text-muted-foreground">{section.tiles.length}</span>
          </div>
        ),
        content: (
          <LauncherTileGrid
            tiles={section.tiles}
            pathname={pathname}
            onNavigate={handleNavigate}
            compact
          />
        ),
      })
    }

    if (filteredSystemItems.length > 0) {
      items.push({
        value: "system",
        title: (
          <div className="flex items-center justify-between gap-3">
            <span>System</span>
            <span className="text-xs text-muted-foreground">{filteredSystemItems.length}</span>
          </div>
        ),
        content: (
          <LauncherSystemList
            items={filteredSystemItems}
            pathname={pathname}
            onNavigate={handleNavigate}
          />
        ),
      })
    }

    return items
  }, [
    filteredGroupedSections,
    filteredSystemItems,
    handleNavigate,
    isWorkspaceMode,
    overflowRootTiles,
    pathname,
  ])

  const handleWorkspaceSelect = (nextWorkspaceId: Id<"workspaces"> | string) => {
    setWorkspaceId(nextWorkspaceId)
    setSearchQuery("")
    if (mode === "workspace") {
      onOpenChange(false)
    }
  }

  const noResults =
    (isWorkspaceMode
      ? workspaces.filter((workspace) =>
          searchTerm
            ? [workspace.name, workspace.type]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(searchTerm))
            : true,
        ).length === 0
      : false) ||
    (!isWorkspaceMode &&
    filteredRootTiles.length === 0 &&
    filteredGroupedSections.length === 0 &&
    filteredSystemItems.length === 0)

  const filteredWorkspaces = useMemo(
    () =>
      workspaces.filter((workspace) =>
        searchTerm
          ? [workspace.name, workspace.type, getWorkspaceTrail(workspace, workspaceLookup)]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(searchTerm))
          : true,
      ),
    [searchTerm, workspaces, workspaceLookup],
  )

  const launcherBackgroundStyle = {
    backgroundImage: currentWorkspaceColor
      ? `radial-gradient(circle at top, ${currentWorkspaceColor}26 0%, transparent 35%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.42) 100%)`
      : "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.42) 100%)",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-full max-h-full w-full max-w-full gap-0 border-none bg-background/95 p-0 shadow-none sm:rounded-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Workspace Launcher</DialogTitle>
          <DialogDescription>
            Full-screen mobile launcher untuk workspace dan fitur Superspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-full flex-col overflow-hidden" style={launcherBackgroundStyle}>
          <header className="shrink-0 border-b border-border/60 bg-background/75 px-4 pb-4 pt-6 backdrop-blur-xl">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {isWorkspaceMode ? "Ganti Workspace" : "Superspace Launcher"}
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {isWorkspaceMode
                      ? (workspaces.length > 1 ? "Pilih Workspace" : currentWorkspace?.name ?? "Workspace")
                      : (currentWorkspace?.name ?? "Workspace Apps")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isWorkspaceMode
                      ? (workspaces.length > 1
                        ? "Pilih workspace dari daftar di bawah. Navigasi atas akan langsung berpindah."
                        : `${currentWorkspace?.type ?? "Workspace"} context for mobile`)
                      : `Apps and grouped menus for ${currentWorkspace?.name ?? "the active workspace"}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!isWorkspaceMode && workspaces.length > 1 ? (
                    <Button
                      variant="outline"
                      className="rounded-full px-3"
                      onClick={() => {
                        onOpenChange(false)
                        onRequestWorkspaceSwitcher?.()
                      }}
                    >
                      Switch workspace
                    </Button>
                  ) : null}
                  <Badge
                    variant="secondary"
                    className="rounded-full px-3 py-1.5"
                    style={currentWorkspaceColor ? { boxShadow: `inset 0 0 0 1px ${currentWorkspaceColor}22` } : undefined}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    {formatThemeLabel(activeTheme)}
                  </Badge>
                </div>
              </div>

              {!isWorkspaceMode && currentWorkspace ? (
                <div
                  className="rounded-[1.75rem] border border-border/60 bg-background/80 p-4 shadow-sm"
                  style={
                    currentWorkspaceColor
                      ? {
                          boxShadow: `inset 0 0 0 1px ${currentWorkspaceColor}1f`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-border/60 bg-background shadow-sm"
                      style={
                        currentWorkspaceColor
                          ? { boxShadow: `inset 0 0 0 1px ${currentWorkspaceColor}22` }
                          : undefined
                      }
                    >
                      <Sparkles
                        className="h-5 w-5"
                        style={currentWorkspaceColor ? { color: currentWorkspaceColor } : undefined}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{currentWorkspace.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {currentWorkspace.type ?? "Workspace"} · themed for mobile
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={isWorkspaceMode ? "Cari workspace..." : "Search apps and menus..."}
                  className="h-12 rounded-xl border-border/60 bg-background/80 pl-11 text-base shadow-sm"
                />
              </div>

              {isWorkspaceMode && workspacePath.length > 1 ? (
                <div className="rounded-[1.5rem] border border-border/60 bg-background/70 px-4 py-3 shadow-sm">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Workspace Aktif
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-foreground">
                    {workspacePath.map((workspace, index) => (
                      <div key={String(workspace._id)} className="flex items-center gap-1.5">
                        <span className={cn(index === workspacePath.length - 1 && "text-primary")}>
                          {workspace.name}
                        </span>
                        {index < workspacePath.length - 1 ? (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </header>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-8 px-4 py-6 pb-10">
              {isWorkspaceMode ? (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Daftar Workspace</h3>
                    <span className="text-xs text-muted-foreground">
                      {filteredWorkspaces.length} visible
                    </span>
                  </div>

                  <div className="mb-2">
                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-[1.8rem] border-dashed border-border/60 gap-3 text-muted-foreground hover:text-foreground hover:border-primary/40"
                      onClick={() => { router.push("/dashboard/workspace"); onOpenChange(false) }}
                    >
                      <Plus className="h-5 w-5" />
                      <span className="text-sm font-medium">Create New Workspace</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {filteredWorkspaces.map((workspace) => {
                        const isActive = String(workspace._id) === String(workspaceId ?? "")
                        const workspaceTrail = getWorkspaceTrail(workspace, workspaceLookup)
                        return (
                          <button
                            key={String(workspace._id)}
                            className={cn(
                              "flex min-h-[172px] w-full flex-col rounded-[1.8rem] border border-border/60 bg-background/80 p-4 text-left shadow-sm transition-colors",
                              isActive && "border-primary/40 bg-primary/5 shadow-md",
                            )}
                            onClick={() => handleWorkspaceSelect(workspace._id)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div
                                className="rounded-[1.2rem] border border-border/60 bg-background/90 p-1.5 shadow-sm"
                                style={workspace.color ? { boxShadow: `inset 0 0 0 1px ${workspace.color}22` } : undefined}
                              >
                                <WorkspaceIcon
                                  workspaceId={!isGuestMode ? workspace._id as Id<"workspaces"> : undefined}
                                  iconName={workspace.icon}
                                  name={workspace.name}
                                  color={workspace.color}
                                  size="lg"
                                  className="size-12 rounded-[0.95rem]"
                                />
                              </div>
                              <div
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/80",
                                  isActive && "border-primary/40 bg-primary/10 text-primary",
                                )}
                              >
                                {isActive ? <Check className="h-4 w-4" /> : null}
                              </div>
                            </div>

                            <div className="mt-4 min-w-0 flex-1">
                              <div className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                                {workspace.name}
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                {workspace.type ?? "Workspace"}
                              </div>
                              {workspaceTrail ? (
                                <div className="mt-3 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                                  {workspaceTrail.split(" / ").map((segment, index, array) => (
                                    <div key={`${workspace._id}:${segment}:${index}`} className="flex items-center gap-1">
                                      <span className={cn(index === array.length - 1 && "font-medium text-foreground/80")}>
                                        {segment}
                                      </span>
                                      {index < array.length - 1 ? (
                                        <ChevronRight className="h-3 w-3" />
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                              {(workspace as any).settings?.enabledFeatures?.length > 0 ? (
                                <div className="mt-2 text-[10px] text-muted-foreground">
                                  {(workspace as any).settings.enabledFeatures.length} features enabled
                                </div>
                              ) : null}
                            </div>
                          </button>
                        )
                      })}
                  </div>
                </section>
              ) : null}

              {!isWorkspaceMode ? (
                <>
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Quick Access</h3>
                      <span className="text-xs text-muted-foreground">
                        {quickAccessTiles.length} pinned
                      </span>
                    </div>
                    <LauncherTileGrid
                      tiles={quickAccessTiles}
                      pathname={pathname}
                      onNavigate={handleNavigate}
                    />
                  </section>

                  {accordionItems.length > 0 ? (
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Browse by Category</h3>
                        <span className="text-xs text-muted-foreground">
                          Organized menus
                        </span>
                      </div>
                      <Accordion
                        type="multiple"
                        className="space-y-3"
                        itemClassName="overflow-hidden rounded-[1.4rem] border-border/60 bg-background/80 shadow-sm"
                        triggerClassName="px-4 py-4 text-sm font-semibold"
                        contentClassName="px-4 pb-4"
                        items={accordionItems}
                      />
                    </section>
                  ) : null}
                </>
              ) : null}

              {noResults ? (
                <section className="py-16 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    No launcher items matched your search.
                  </p>
                </section>
              ) : null}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

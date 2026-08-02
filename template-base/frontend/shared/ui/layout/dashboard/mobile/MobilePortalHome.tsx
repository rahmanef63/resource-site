"use client"

import React, { useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Search, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Star,
  LayoutGrid, Zap, Users, MessageCircle, FileText,
  BarChart2, Settings, Palette, Heart, Building2, Cpu,
  ChevronDown, ChevronUp, Loader2, Trash2,
} from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { useAuthed } from "@/frontend/shared/foundation/auth/hooks/useAuthed"
import { useNavItems } from "@/frontend/shared/ui/layout/sidebar/primary/hooks/useNavItems"
import { useSystemNavItems } from "@/frontend/shared/ui/layout/sidebar/primary/hooks/useSystemNavItems"
import { useUnifiedMobileWorkspaceContext } from "@/frontend/shared/ui/layout/dashboard/mobile/useUnifiedMobileWorkspaceContext"
import { getAllFeatures, getFeatureById } from "@/frontend/shared/lib/features/registry"
import { getIconComponent } from "@/frontend/shared/ui/icons/dynamic-icon"
import {
  getDashboardBaseForMode,
  getDashboardFeatureHref,
} from "@/frontend/shared/ui/layout/dashboard/dashboard-routes"
import {
  getFeatureInstallErrorFeedback,
  getFeatureInstallPreflightFeedback,
} from "@/frontend/shared/ui/layout/menus/utils/install-feature-feedback"
import type { FeatureConfig } from "@/frontend/shared/lib/features/defineFeature"

// ─── Types ───────────────────────────────────────────────────────────────────

type AppItem = {
  id: string
  title: string
  description: string
  category: string
  categoryKey: string
  href: string
  icon: React.ElementType
  status: "stable" | "beta" | "development" | "experimental" | "deprecated"
  isInstalled: boolean
  appStore?: FeatureConfig["appStore"]
  tags?: string[]
}

type CategorySection = {
  key: string
  label: string
  icon: React.ElementType
  order: number
  apps: AppItem[]
}

// ─── Category Metadata ───────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; Icon: React.ElementType; order: number }> = {
  productivity: { label: "Productivity", Icon: Zap, order: 1 },
  collaboration: { label: "Collaboration", Icon: Users, order: 2 },
  communication: { label: "Communication", Icon: MessageCircle, order: 3 },
  content: { label: "Content", Icon: FileText, order: 4 },
  analytics: { label: "Analytics", Icon: BarChart2, order: 5 },
  administration: { label: "Administration", Icon: Settings, order: 6 },
  creativity: { label: "Creativity", Icon: Palette, order: 7 },
  social: { label: "Social", Icon: Heart, order: 8 },
  workspace: { label: "Workspace", Icon: Building2, order: 9 },
  system: { label: "System", Icon: Cpu, order: 10 },
}

// ─── Helper: group apps into category sections ───────────────────────────────

function groupByCategory(apps: AppItem[]): CategorySection[] {
  const map = new Map<string, AppItem[]>()
  for (const app of apps) {
    const key = app.categoryKey || "workspace"
    const bucket = map.get(key) ?? []
    bucket.push(app)
    map.set(key, bucket)
  }
  return Array.from(map.entries())
    .map(([key, list]) => {
      const meta = CATEGORY_META[key]
      return {
        key,
        label: meta?.label ?? key,
        icon: meta?.Icon ?? LayoutGrid,
        order: meta?.order ?? 99,
        apps: list.sort((a, b) => a.title.localeCompare(b.title)),
      }
    })
    .sort((a, b) => a.order - b.order)
}

// ─── Helper: haptic feedback ──────────────────────────────────────────────────

function vibrate(ms = 10) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(ms)
  }
}

// ─── AppTileIcon ─────────────────────────────────────────────────────────────

function AppTileIcon({
  icon: Icon,
  workspaceColor,
  size = "md",
}: {
  icon: React.ElementType
  workspaceColor?: string
  size?: "sm" | "md" | "lg"
}) {
  const dim = size === "lg" ? "h-[72px] w-[72px]" : size === "sm" ? "h-12 w-12" : "h-16 w-16"
  const iconDim = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-5 w-5" : "h-7 w-7"

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/50 shadow-xl backdrop-blur-xl",
        dim,
      )}
      style={{
        backgroundImage: workspaceColor
          ? `linear-gradient(135deg, ${workspaceColor}1f, ${workspaceColor}0a)`
          : "linear-gradient(135deg, hsl(var(--primary) / 0.14), transparent)",
        boxShadow: workspaceColor
          ? `inset 0 0 0 1px ${workspaceColor}22, 0 4px 16px ${workspaceColor}14`
          : undefined,
      }}
    >
      <Icon
        className={iconDim}
        style={workspaceColor ? { color: workspaceColor } : undefined}
      />
    </div>
  )
}

// ─── AppTile ──────────────────────────────────────────────────────────────────

function AppTile({
  app,
  workspaceColor,
  onSelect,
  compact = false,
}: {
  app: AppItem
  workspaceColor?: string
  onSelect: (app: AppItem) => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-2 active:scale-[0.94] transition-transform"
      onClick={() => { vibrate(8); onSelect(app) }}
    >
      <AppTileIcon icon={app.icon} workspaceColor={workspaceColor} size={compact ? "sm" : "md"} />
      <div className="w-full space-y-0.5 text-center">
        <p className={cn("line-clamp-2 font-semibold leading-tight text-foreground", compact ? "text-[10px]" : "text-[11px]")}>
          {app.title}
        </p>
        {!compact && (
          <p className="line-clamp-1 text-[9px] text-muted-foreground">{app.category}</p>
        )}
      </div>
    </button>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, appStoreBadge }: { status: AppItem["status"]; appStoreBadge?: string }) {
  if (appStoreBadge === "featured") {
    return <Badge className="gap-1 bg-amber-500/15 text-amber-600 border-amber-500/20 text-[10px]"><Star className="h-2.5 w-2.5" /> Featured</Badge>
  }
  if (appStoreBadge === "new") {
    return <Badge className="gap-1 bg-blue-500/15 text-blue-600 border-blue-500/20 text-[10px]"><Sparkles className="h-2.5 w-2.5" /> New</Badge>
  }
  if (appStoreBadge === "popular") {
    return <Badge className="gap-1 bg-rose-500/15 text-rose-600 border-rose-500/20 text-[10px]">Popular</Badge>
  }
  if (appStoreBadge === "updated") {
    return <Badge variant="outline" className="text-[10px]">Updated</Badge>
  }
  if (status === "beta") {
    return <Badge variant="secondary" className="text-[10px]">Beta</Badge>
  }
  return null
}

// ─── HorizontalAppRow ─────────────────────────────────────────────────────────

function HorizontalAppRow({
  section,
  workspaceColor,
  onSelect,
  onSeeAll,
}: {
  section: CategorySection
  workspaceColor?: string
  onSelect: (app: AppItem) => void
  onSeeAll: () => void
}) {
  const SectionIcon = section.icon
  if (section.apps.length === 0) return null

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SectionIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{section.label}</span>
          <span className="text-xs text-muted-foreground">({section.apps.length})</span>
        </div>
        {section.apps.length > 4 && (
          <button
            type="button"
            onClick={() => { vibrate(6); onSeeAll() }}
            className="flex items-center gap-0.5 text-xs font-medium text-primary active:opacity-70"
          >
            See All <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-5 flex gap-5 overflow-x-auto px-5 pb-1 snap-x snap-mandatory">
        {section.apps.map((app) => (
          <div key={app.id} className="shrink-0 w-[72px] snap-start">
            <AppTile app={app} workspaceColor={workspaceColor} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Featured Section (Discover) ─────────────────────────────────────────────

function FeaturedSection({
  apps,
  workspaceColor,
  onSelect,
}: {
  apps: AppItem[]
  workspaceColor?: string
  onSelect: (app: AppItem) => void
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-sm font-semibold text-foreground">Featured</span>
      </div>
      <Carousel opts={{ align: "start", loop: false }} className="-mx-5">
        <CarouselContent className="px-5 gap-3">
          {apps.map((app) => (
            <CarouselItem key={app.id} className="basis-[85%]">
              <button
                type="button"
                onClick={() => { vibrate(8); onSelect(app) }}
                className="w-full active:scale-[0.98] transition-transform"
              >
                <div
                  className="relative flex h-40 flex-col justify-end overflow-hidden rounded-xl border border-border/50 p-4"
                  style={{
                    backgroundImage: app.appStore?.banner
                      ? `url(${app.appStore.banner})`
                      : workspaceColor
                        ? `linear-gradient(135deg, ${workspaceColor}28, ${workspaceColor}08)`
                        : "linear-gradient(135deg, hsl(var(--primary)/0.18), transparent)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Gradient overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-xl" />
                  <div className="relative flex items-end gap-3">
                    <AppTileIcon icon={app.icon} workspaceColor={workspaceColor} size="sm" />
                    <div className="min-w-0 text-left">
                      <p className="font-bold text-white drop-shadow text-sm line-clamp-1">{app.title}</p>
                      <p className="text-[11px] text-white/70 line-clamp-1">{app.description}</p>
                    </div>
                    <StatusBadge status={app.status} appStoreBadge={app.appStore?.badge} />
                  </div>
                </div>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

// ─── Discover Preview Drawer (compact confirm sheet) ─────────────────────────

function DiscoverPreviewDrawer({
  app,
  workspaceColor,
  onClose,
  onInstall,
  isInstalling,
  onViewDetails,
}: {
  app: AppItem | null
  workspaceColor?: string
  onClose: () => void
  onInstall: (id: string) => void
  isInstalling: boolean
  onViewDetails: (app: AppItem) => void
}) {
  return (
    <Drawer open={Boolean(app)} onOpenChange={(open) => !open && onClose()} direction="bottom">
      <DrawerContent className="max-h-[50dvh] rounded-t-[2rem] border-border/60 px-0 pb-0 focus:outline-none">
        {app && (
          <div className="flex flex-col gap-4 px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-2">
            {/* Drag handle */}
            <div className="mx-auto h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/25" />

            {/* App identity */}
            <div className="flex items-center gap-4">
              <AppTileIcon icon={app.icon} workspaceColor={workspaceColor} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold leading-tight text-foreground">{app.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{app.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <StatusBadge status={app.status} appStoreBadge={app.appStore?.badge} />
                  <Badge variant="outline" className="text-[10px]">{app.category}</Badge>
                </div>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="h-12 flex-1 rounded-xl font-semibold"
                onClick={() => onViewDetails(app)}
              >
                View Details
              </Button>
              <Button
                className="h-12 flex-1 rounded-xl font-semibold"
                disabled={isInstalling}
                style={workspaceColor ? { backgroundColor: workspaceColor, borderColor: workspaceColor } : undefined}
                onClick={() => onInstall(app.id)}
              >
                {isInstalling ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Installing…</>
                ) : (
                  "Install"
                )}
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}

// ─── App Detail Page (Layer 3 — full-screen slide-in overlay) ─────────────────

function AppDetailPage({
  app,
  workspaceColor,
  onBack,
  onOpen,
  onInstall,
  onUninstall,
  isInstalling,
  isUninstalling,
}: {
  app: AppItem | null
  workspaceColor?: string
  onBack: () => void
  onOpen: (href: string) => void
  onInstall: (id: string) => void
  onUninstall: (id: string) => void
  isInstalling: boolean
  isUninstalling: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const hasScreenshots = (app?.appStore?.screenshots?.length ?? 0) > 0
  const hasLongDesc = Boolean(app?.appStore?.longDescription)
  const longDescPreviewLength = 160

  React.useEffect(() => {
    if (!app) setExpanded(false)
  }, [app])

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex flex-col bg-background",
        "transition-transform duration-300 ease-in-out will-change-transform",
        app ? "translate-x-0" : "translate-x-full",
      )}
    >
      {app && (
        <>
          {/* ── Header ── */}
          <header className="flex shrink-0 items-center border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-xl">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 text-sm font-medium text-primary active:opacity-70"
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </button>
            <span className="flex-1 truncate text-center text-sm font-semibold text-foreground">
              {app.title}
            </span>
            {/* Balancer for centering title */}
            <div className="w-14" />
          </header>

          {/* ── Scrollable body ── */}
          <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain">
            <div className="space-y-5 px-5 pb-8 pt-6">

              {/* App identity */}
              <div className="flex items-start gap-4">
                <AppTileIcon icon={app.icon} workspaceColor={workspaceColor} size="lg" />
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-xl font-bold leading-tight text-foreground">{app.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{app.category}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <StatusBadge status={app.status} appStoreBadge={app.appStore?.badge} />
                    {app.isInstalled && (
                      <Badge variant="outline" className="gap-1 text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Installed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              {/* Screenshot carousel */}
              {hasScreenshots && (
                <section>
                  <Carousel opts={{ align: "start" }} className="-mx-5">
                    <CarouselContent className="gap-3 px-5">
                      {app.appStore!.screenshots!.map((src, i) => (
                        <CarouselItem key={i} className="basis-[80%]">
                          <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-border/60 bg-muted">
                            <Image
                              src={src}
                              alt={`${app.title} screenshot ${i + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 80vw"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-3" />
                    <CarouselNext className="right-3" />
                  </Carousel>
                </section>
              )}

              {/* Description */}
              <section className="space-y-2">
                <p className="text-sm leading-relaxed text-foreground">{app.description}</p>
                {hasLongDesc && (
                  <>
                    <p className={cn("text-sm leading-relaxed text-muted-foreground", !expanded && "line-clamp-3")}>
                      {expanded
                        ? app.appStore!.longDescription
                        : app.appStore!.longDescription!.slice(0, longDescPreviewLength)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="flex items-center gap-0.5 text-xs font-semibold text-primary active:opacity-70"
                    >
                      {expanded ? (
                        <><ChevronUp className="h-3 w-3" /> Less</>
                      ) : (
                        <><ChevronDown className="h-3 w-3" /> More</>
                      )}
                    </button>
                  </>
                )}
              </section>

              {/* Highlights */}
              {app.appStore?.highlights && app.appStore.highlights.length > 0 && (
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Highlights</p>
                  <ul className="space-y-2">
                    {app.appStore.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={workspaceColor ? { color: workspaceColor } : undefined}
                        />
                        {h}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Tags */}
              {app.tags && app.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {app.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[11px] font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* What's New */}
              {app.appStore?.whatsNew && (
                <section className="rounded-xl border border-border/50 bg-muted/40 p-4">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">What&apos;s New</p>
                  <p className="text-sm text-foreground">{app.appStore.whatsNew}</p>
                </section>
              )}
            </div>
          </div>

          {/* ── Sticky CTA ── */}
          <div className="shrink-0 border-t border-border/60 bg-background/95 px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4 backdrop-blur-xl">
            {app.isInstalled ? (
              <div className="flex flex-col gap-2">
                <Button
                  className="h-12 w-full rounded-xl text-base font-semibold"
                  onClick={() => onOpen(app.href)}
                  style={workspaceColor ? { backgroundColor: workspaceColor, borderColor: workspaceColor } : undefined}
                >
                  Open {app.title}
                </Button>
                <Button
                  variant="outline"
                  className="h-10 w-full rounded-xl text-sm font-medium text-destructive hover:text-destructive"
                  disabled={isUninstalling}
                  onClick={() => onUninstall(app.id)}
                >
                  {isUninstalling ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Removing…</>
                  ) : (
                    <><Trash2 className="mr-2 h-4 w-4" />Remove</>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                className="h-12 w-full rounded-xl text-base font-semibold"
                disabled={isInstalling}
                style={workspaceColor ? { backgroundColor: workspaceColor, borderColor: workspaceColor } : undefined}
                onClick={() => onInstall(app.id)}
              >
                {isInstalling ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Installing…</>
                ) : (
                  "Install"
                )}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Full Category Sheet ──────────────────────────────────────────────────────

function FullCategorySheet({
  section,
  workspaceColor,
  onClose,
  onSelect,
}: {
  section: CategorySection | null
  workspaceColor?: string
  onClose: () => void
  onSelect: (app: AppItem) => void
}) {
  const SectionIcon = section?.icon ?? LayoutGrid
  return (
    <Drawer open={Boolean(section)} onOpenChange={(open) => !open && onClose()} direction="bottom">
      <DrawerContent className="max-h-[85dvh] rounded-t-[2rem] border-border/60 px-0 pb-0 focus:outline-none">
        {section && (
          <div className="flex h-full flex-col overflow-hidden">
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/25" />
            <DrawerHeader className="shrink-0 border-b border-border/50 px-5 pb-4 pt-3">
              <div className="flex items-center gap-2">
                <SectionIcon className="h-5 w-5 text-muted-foreground" />
                <DrawerTitle className="text-lg">{section.label}</DrawerTitle>
                <span className="text-sm text-muted-foreground">· {section.apps.length} apps</span>
              </div>
            </DrawerHeader>
            <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-5 pb-8 pt-5">
              <div className="grid grid-cols-4 gap-x-4 gap-y-8">
                {section.apps.map((app) => (
                  <AppTile
                    key={app.id}
                    app={app}
                    workspaceColor={workspaceColor}
                    onSelect={(a) => { onClose(); onSelect(a) }}
                    compact
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-border/60 bg-background/60 backdrop-blur-xl">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {query ? "No apps matched your search." : "No apps here yet."}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {query ? "Try another keyword or check Discover." : "Switch to Discover to explore all apps."}
      </p>
    </div>
  )
}

// ─── MobilePortalHome (main export) ──────────────────────────────────────────

export function MobilePortalHome() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"apps" | "discover">("apps")
  const [detailApp, setDetailApp] = useState<AppItem | null>(null)
  const [discoverPreview, setDiscoverPreview] = useState<AppItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { workspaceId, currentWorkspace, isGuestMode } = useUnifiedMobileWorkspaceContext()
  const { isLoading: isAuthLoading, isSignedIn, isAuthenticated } = useAuthed()
  const { navItems, systemItems: baseSystemItems } = useNavItems(workspaceId)
  const systemItems = useSystemNavItems(baseSystemItems)
  const routeBase = getDashboardBaseForMode(isGuestMode)
  const workspaceColor = currentWorkspace?.color
  const searchTerm = searchQuery.trim().toLowerCase()

  // ── Feature install/uninstall mutations ────────────────────────────────────
  const installMutation = useMutation(api["features/menus/menuItems"].installFeatureMenus)
  const uninstallMutation = useMutation(api["features/menus/menuItems"].uninstallFeatureMenus)
  const [installingIds, setInstallingIds] = useState<Set<string>>(new Set())
  const [uninstallingIds, setUninstallingIds] = useState<Set<string>>(new Set())

  const handleInstall = async (id: string) => {
    if (!workspaceId || installingIds.has(id)) return

    const authFeedback = getFeatureInstallPreflightFeedback({
      isAuthLoading,
      isSignedIn,
      isAuthenticated,
    })
    if (authFeedback) {
      toast.error(authFeedback.title, {
        description: authFeedback.description,
      })
      return
    }

    setInstallingIds((s) => new Set(s).add(id))
    try {
      await installMutation({ workspaceId, featureSlugs: [id] })
      toast.success("Feature installed")
      setDiscoverPreview(null)
    } catch (error) {
      const feedback = getFeatureInstallErrorFeedback(error)
      toast.error(feedback.title, {
        description: feedback.description,
      })
    } finally {
      setInstallingIds((s) => { const n = new Set(s); n.delete(id); return n })
    }
  }

  const handleUninstall = async (id: string) => {
    if (!workspaceId || uninstallingIds.has(id)) return
    setUninstallingIds((s) => new Set(s).add(id))
    try {
      await uninstallMutation({ workspaceId, featureSlugs: [id] })
      toast.success("Feature removed")
      setDetailApp(null)
    } catch {
      toast.error("Failed to remove feature")
    } finally {
      setUninstallingIds((s) => { const n = new Set(s); n.delete(id); return n })
    }
  }

  // ── Build installed apps from navItems ─────────────────────────────────────
  const installedApps = useMemo<AppItem[]>(() => {
    const result: AppItem[] = []
    const seen = new Set<string>()

    function processItem(item: { id: string; title?: string; name?: string; description?: string; icon?: React.ElementType; children?: unknown[]; isGroup?: boolean; metadata?: Record<string, unknown>; url?: string }) {
      if (item.isGroup) return
      if (item.id === "overview" || item.id === "ai") return
      if (seen.has(item.id)) return
      seen.add(item.id)

      const feature = getFeatureById(item.id)
      const meta = CATEGORY_META[feature?.ui.category ?? "workspace"]
      const IconComp = (item.icon as React.ElementType | undefined)
        ?? (feature?.ui.icon ? (getIconComponent(feature.ui.icon) as React.ElementType | null) : null)
        ?? LayoutGrid

      result.push({
        id: item.id,
        title: (item.title as string | undefined) ?? (item.name as string | undefined) ?? item.id,
        description: (item.description as string | undefined) ?? feature?.description ?? "",
        category: meta?.label ?? "Workspace",
        categoryKey: feature?.ui.category ?? "workspace",
        href: getDashboardFeatureHref(routeBase, item.id),
        icon: IconComp,
        status: (feature?.status.state as AppItem["status"]) ?? "stable",
        isInstalled: true,
        appStore: feature?.appStore,
        tags: feature?.tags,
      })
    }

    for (const item of navItems) {
      processItem(item as Parameters<typeof processItem>[0])
      for (const child of (item.children ?? [])) {
        processItem(child as Parameters<typeof processItem>[0])
      }
    }

    for (const sysItem of systemItems) {
      if (sysItem.id === "overview" || sysItem.id === "ai") continue
      if (seen.has(sysItem.id)) continue
      seen.add(sysItem.id)
      result.push({
        id: sysItem.id,
        title: sysItem.name,
        description: sysItem.description ?? "",
        category: CATEGORY_META.system.label,
        categoryKey: "system",
        href: sysItem.url,
        icon: sysItem.icon as React.ElementType,
        status: "stable",
        isInstalled: true,
        appStore: undefined,
        tags: [],
      })
    }

    return result
  }, [navItems, systemItems, routeBase])

  // ── Build all available apps from registry ─────────────────────────────────
  const allApps = useMemo<AppItem[]>(() => {
    const installedIds = new Set(installedApps.map((a) => a.id))

    return getAllFeatures()
      .filter((f) => f.technical.hasUI !== false && f.status.isReady)
      .map((f) => {
        const meta = CATEGORY_META[f.ui.category ?? "workspace"]
        const IconComp = (getIconComponent(f.ui.icon) as React.ElementType | null) ?? LayoutGrid
        return {
          id: f.id,
          title: f.name,
          description: f.description,
          category: meta?.label ?? f.ui.category,
          categoryKey: f.ui.category,
          href: getDashboardFeatureHref(routeBase, f.id),
          icon: IconComp,
          status: f.status.state as AppItem["status"],
          isInstalled: installedIds.has(f.id),
          appStore: f.appStore,
          tags: f.tags,
        }
      })
  }, [installedApps, routeBase])

  // ── Search filter ──────────────────────────────────────────────────────────
  const filteredInstalled = useMemo(
    () =>
      searchTerm
        ? installedApps.filter((a) =>
          [a.title, a.description, a.category, a.id, ...(a.tags ?? [])]
            .some((v) => v?.toLowerCase().includes(searchTerm)),
        )
        : installedApps,
    [installedApps, searchTerm],
  )

  const filteredAll = useMemo(
    () =>
      searchTerm
        ? allApps.filter((a) =>
          [a.title, a.description, a.category, a.id, ...(a.tags ?? [])]
            .some((v) => v?.toLowerCase().includes(searchTerm)),
        )
        : allApps,
    [allApps, searchTerm],
  )

  // ── Grouped sections ───────────────────────────────────────────────────────
  const installedCategories = useMemo(() => groupByCategory(filteredInstalled), [filteredInstalled])
  const discoverCategories = useMemo(() => groupByCategory(filteredAll), [filteredAll])

  // ── Featured apps ──────────────────────────────────────────────────────────
  const featuredApps = useMemo(
    () => allApps.filter((a) => a.appStore?.badge === "featured" || a.appStore?.badge === "new"),
    [allApps],
  )

  // ── Active category section ────────────────────────────────────────────────
  const activeCategorySection = useMemo(
    () =>
      activeCategory
        ? (activeTab === "apps" ? installedCategories : discoverCategories).find(
          (s) => s.key === activeCategory,
        ) ?? null
        : null,
    [activeCategory, activeTab, installedCategories, discoverCategories],
  )

  // My Apps: tap → navigate directly (no drawer)
  const handleMyAppsSelect = (app: AppItem) => {
    vibrate(8)
    router.push(app.href)
  }

  // Discover: installed → navigate, uninstalled → compact confirm drawer
  const handleDiscoverSelect = (app: AppItem) => {
    vibrate(8)
    setActiveCategory(null)
    if (app.isInstalled) {
      router.push(app.href)
    } else {
      setDiscoverPreview(app)
    }
  }

  // "View Details" from confirm drawer → open full-screen detail page
  const handleViewDetails = (app: AppItem) => {
    setDiscoverPreview(null)
    setDetailApp(app)
  }

  // CTA from detail page footer
  const handleOpenFromDetail = (href: string) => {
    setDetailApp(null)
    router.push(href)
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 px-5 pb-3 pt-4">
        {/* Tab switcher — pill style */}
        <div className="mt-3 flex gap-1 rounded-xl bg-muted/60 p-1 border border-border/40">
          <button
            type="button"
            onClick={() => setActiveTab("apps")}
            className={cn(
              "flex-1 rounded-xl py-2 text-sm font-semibold transition-all",
              activeTab === "apps"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            My Apps
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("discover")}
            className={cn(
              "flex-1 rounded-xl py-2 text-sm font-semibold transition-all",
              activeTab === "discover"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            Menu Store
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${currentWorkspace?.name ?? "apps"}...`}
            className={cn(
              "h-11 rounded-xl border-border/50 bg-muted/40 pl-10 pr-4 text-sm",
              workspaceColor && "focus-visible:ring-0",
            )}
            style={workspaceColor ? { boxShadow: `inset 0 0 0 1px ${workspaceColor}18` } : undefined}
          />
        </div>
      </header>

      {/* ── Layer 1: My Apps ───────────────────────────────────────────────── */}
      {activeTab === "apps" && (
        <div className="no-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 pb-28 pt-4 space-y-7">
          {installedCategories.map((section) => (
            <HorizontalAppRow
              key={section.key}
              section={section}
              workspaceColor={workspaceColor}
              onSelect={handleMyAppsSelect}
              onSeeAll={() => { vibrate(6); setActiveCategory(section.key) }}
            />
          ))}
          {filteredInstalled.length === 0 && <EmptyState query={searchQuery} />}
        </div>
      )}

      {/* ── Layer 2: Discover ──────────────────────────────────────────────── */}
      {activeTab === "discover" && (
        <div className="no-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 pb-28 pt-4 space-y-7">
          {/* Featured banner carousel */}
          {featuredApps.length > 0 && !searchTerm && (
            <FeaturedSection
              apps={featuredApps}
              workspaceColor={workspaceColor}
              onSelect={handleDiscoverSelect}
            />
          )}

          {discoverCategories.map((section) => (
            <HorizontalAppRow
              key={section.key}
              section={section}
              workspaceColor={workspaceColor}
              onSelect={handleDiscoverSelect}
              onSeeAll={() => { vibrate(6); setActiveCategory(section.key) }}
            />
          ))}
          {filteredAll.length === 0 && <EmptyState query={searchQuery} />}
        </div>
      )}

      {/* ── Discover confirm drawer (uninstalled apps) ────────────────────── */}
      <DiscoverPreviewDrawer
        app={discoverPreview}
        workspaceColor={workspaceColor}
        onClose={() => setDiscoverPreview(null)}
        onInstall={handleInstall}
        isInstalling={discoverPreview ? installingIds.has(discoverPreview.id) : false}
        onViewDetails={handleViewDetails}
      />

      {/* ── Full Category Sheet ────────────────────────────────────────────── */}
      <FullCategorySheet
        section={activeCategorySection}
        workspaceColor={workspaceColor}
        onClose={() => setActiveCategory(null)}
        onSelect={activeTab === "apps" ? handleMyAppsSelect : handleDiscoverSelect}
      />

      {/* ── Layer 3: App Detail Page (full-screen slide-in) ────────────────── */}
      <AppDetailPage
        app={detailApp}
        workspaceColor={workspaceColor}
        onBack={() => setDetailApp(null)}
        onOpen={handleOpenFromDetail}
        onInstall={handleInstall}
        onUninstall={handleUninstall}
        isInstalling={detailApp ? installingIds.has(detailApp.id) : false}
        isUninstalling={detailApp ? uninstallingIds.has(detailApp.id) : false}
      />
    </div>
  )
}

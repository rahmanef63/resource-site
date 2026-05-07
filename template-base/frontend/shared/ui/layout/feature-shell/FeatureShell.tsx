"use client"

/**
 * Feature Shell
 *
 * Unified three-column shell for feature pages. Replaces per-feature header
 * bars + ad-hoc AI drawers with one consistent layout:
 *
 *   [ optional left nav ] [ center content ] [ AI + optional inspector ]
 *
 * Right-panel state (mode + collapsed) lives in the global rightPanelStore
 * keyed by featureId. The header AI button (site-header) reaches into the
 * same store to open the inspector pre-selected to the AI tab — no parallel
 * dialog/drawer.
 *
 * Universal tabs (DRY across every feature):
 *   - inspector: only when `inspector` prop is passed (slice-specific)
 *   - ai:           always (AIChatPanel falls back to default agent)
 *   - notifications: always (workspace-scoped Inbox)
 *   - settings:     always (feature-scoped ComprehensiveSettingsPage)
 *
 * Header buttons (AI / Bell / Settings) in site-header dispatch into
 * `rightPanelStore.openTab(featureId, mode)` — no parallel dialogs.
 *
 * Mobile: ThreeColumnLayout swaps the right panel for `MobileInspectorDrawer`
 * automatically below 768px; the same tab UI renders inside the drawer.
 */

import * as React from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import { AIChatPanel } from "@/frontend/shared/ui/ai-assistant/AIChatPanel"
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column"
import type { RightPanelMode } from "@/frontend/shared/ui/layout/container/three-column"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import {
  useRightPanelMount,
  useRightPanelState,
  useRightPanelStore,
} from "./rightPanelStore"

// Heavy panels — lazy-load so the inspector tab bundle isn't paid up-front.
const NotificationsPage = dynamic(
  () => import("@/frontend/shared/foundation/utils/notifications/page"),
  { ssr: false, loading: () => <TabLoading label="Loading notifications…" /> },
)
const ComprehensiveSettingsPage = dynamic(
  () => import("@/frontend/shared/settings/comprehensive").then((m) => m.ComprehensiveSettingsPage),
  { ssr: false, loading: () => <TabLoading label="Loading settings…" /> },
)

function TabLoading({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}

type AIChatPanelContext = React.ComponentProps<typeof AIChatPanel>["context"]

type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "full"

const MAX_WIDTH_CLASSES: Record<Exclude<MaxWidth, "full">, string> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
}

export interface FeatureShellProps {
  featureId: string

  children: React.ReactNode

  leftPanel?: React.ReactNode
  leftTitle?: string
  leftStats?: string
  leftActions?: React.ReactNode

  /**
   * Optional inspector content (e.g. selected-item detail). When provided,
   * the right panel shows tabs: Inspector / AI (AI only when feature has
   * a registered agent).
   */
  inspector?: React.ReactNode

  aiContext?: AIChatPanelContext
  aiSuggestions?: string[]
  aiWelcomeMessage?: string
  aiPlaceholder?: string

  storageKey?: string
  defaultRightCollapsed?: boolean

  padding?: boolean
  maxWidth?: MaxWidth
  centered?: boolean
  contentClassName?: string
}

export function FeatureShell({
  featureId,
  children,
  leftPanel,
  leftTitle,
  leftStats,
  leftActions,
  inspector,
  aiContext,
  aiSuggestions,
  aiWelcomeMessage,
  aiPlaceholder,
  storageKey,
  defaultRightCollapsed = true,
  padding = false,
  maxWidth = "full",
  centered = false,
  contentClassName,
}: FeatureShellProps) {
  const hasInspector = Boolean(inspector)
  const hasLeft = Boolean(leftPanel)
  const { workspaceId } = useWorkspaceContext()

  const initialMode: RightPanelMode = hasInspector ? "inspector" : "ai"

  useRightPanelMount(featureId, {
    mode: initialMode,
    collapsed: defaultRightCollapsed,
  })

  const panel = useRightPanelState(featureId)
  const setMode = useRightPanelStore((s) => s.setMode)
  const setCollapsed = useRightPanelStore((s) => s.setCollapsed)

  // Universal tabs: every FeatureShell exposes AI / Inbox / Settings tabs.
  // Inspector tab is added when the slice provides an `inspector` prop
  // (slice-specific detail view). DRY across all features regardless of
  // whether they register a feature-specific AI agent — AIChatPanel
  // gracefully falls back to a default agent when none is registered.
  const availableModes = React.useMemo<RightPanelMode[]>(() => {
    const modes: RightPanelMode[] = []
    if (hasInspector) modes.push("inspector")
    modes.push("ai", "notifications", "settings")
    return modes
  }, [hasInspector])

  const hasRightPanel = availableModes.length > 0

  // Coerce mode to a legal one if the persisted mode is no longer available.
  const effectiveMode: RightPanelMode = React.useMemo(() => {
    if (availableModes.includes(panel.mode)) return panel.mode
    return availableModes[0] ?? "ai"
  }, [panel.mode, availableModes])

  React.useEffect(() => {
    if (effectiveMode !== panel.mode) {
      setMode(featureId, effectiveMode)
    }
  }, [effectiveMode, panel.mode, featureId, setMode])

  const aiPanel = (
    <AIChatPanel
      featureId={featureId}
      placeholder={aiPlaceholder}
      context={aiContext}
      suggestions={aiSuggestions}
      welcomeMessage={aiWelcomeMessage}
      showDebugPanel={false}
    />
  )

  const notificationsPanel = (
    <div className="h-full overflow-hidden">
      <NotificationsPage workspaceId={workspaceId} />
    </div>
  )

  const settingsPanel = (
    <div className="h-full overflow-hidden">
      <ComprehensiveSettingsPage
        defaultTab="features"
        defaultFeatureSlug={featureId}
      />
    </div>
  )

  const rightContent = !hasRightPanel
    ? null
    : effectiveMode === "ai"
      ? aiPanel
      : effectiveMode === "notifications"
        ? notificationsPanel
        : effectiveMode === "settings"
          ? settingsPanel
          : (inspector ?? aiPanel)

  const mainContent = (
    <div
      className={cn(
        "h-full min-h-0 w-full overflow-auto",
        padding && "p-4 sm:p-6",
        centered && "flex flex-col items-center justify-center",
        contentClassName,
      )}
    >
      <div
        className={cn(
          "w-full",
          !padding && maxWidth === "full" && "h-full",
          maxWidth !== "full" && MAX_WIDTH_CLASSES[maxWidth],
          maxWidth !== "full" && "mx-auto",
        )}
      >
        {children}
      </div>
    </div>
  )

  // Show tab UI only when both modes available (>1).
  const showTabs = availableModes.length > 1

  return (
    <FeatureThreeColumnLayout
      preset="feature"
      storageKey={storageKey ?? `${featureId}-layout`}
      persistState
      resizable
      leftHidden={!hasLeft}
      rightHidden={!hasRightPanel}
      sidebarContent={leftPanel ?? null}
      sidebarTitle={leftTitle}
      sidebarStats={leftStats}
      sidebarActions={leftActions}
      mainContent={mainContent}
      inspector={rightContent}
      rightPanelConfig={
        showTabs
          ? {
              modes: availableModes,
              defaultMode: availableModes[0],
              collapsible: true,
            }
          : undefined
      }
      rightPanelMode={showTabs ? effectiveMode : undefined}
      onRightPanelModeChange={
        showTabs ? (m) => setMode(featureId, m) : undefined
      }
      rightCollapsed={panel.collapsed}
      onRightCollapsedChange={(c) => setCollapsed(featureId, c)}
      defaultRightCollapsed={defaultRightCollapsed}
    />
  )
}

export default FeatureShell

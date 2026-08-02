/**
 * Right Panel Store
 *
 * SSOT for FeatureShell right-panel state — replaces scattered local
 * useState across FeatureShell + DatabaseView + ad-hoc inspector
 * implementations. Keyed by featureId so multiple slices coexist
 * without collisions, and so the global header AI button can reach
 * into the active feature's panel.
 *
 * Bridge purpose: header AI trigger (in site-header) dispatches
 * `openTab(featureId, "ai")` to this store; FeatureShell subscribes
 * and reflects the new mode/uncollapsed state. No more parallel
 * Dialog/Drawer in the header.
 *
 * Persistence: per-feature mode + collapsed are mirrored to
 * localStorage so reload preserves user preference.
 */

"use client"

import * as React from "react"
import { create } from "zustand"
import type { RightPanelMode } from "@/frontend/shared/ui/layout/container/three-column"

interface FeaturePanelState {
  mode: RightPanelMode
  collapsed: boolean
  /** True between FeatureShell mount and unmount — header trigger uses this to decide store-dispatch vs fallback dialog. */
  mounted: boolean
}

interface RightPanelStore {
  panels: Record<string, FeaturePanelState>
  mount: (featureId: string, init?: Partial<FeaturePanelState>) => void
  unmount: (featureId: string) => void
  setMode: (featureId: string, mode: RightPanelMode) => void
  setCollapsed: (featureId: string, collapsed: boolean) => void
  toggleCollapsed: (featureId: string) => void
  /** Open a specific tab — sets mode AND uncollapses. Used by header trigger. */
  openTab: (featureId: string, mode: RightPanelMode) => void
}

const STORAGE_PREFIX = "rightPanel"

function storageKey(featureId: string): string {
  return `${STORAGE_PREFIX}:${featureId}`
}

function readPersisted(featureId: string): Partial<FeaturePanelState> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(storageKey(featureId))
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<FeaturePanelState>
    return {
      mode: parsed.mode,
      collapsed: parsed.collapsed,
    }
  } catch {
    return {}
  }
}

function writePersisted(featureId: string, state: FeaturePanelState): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(
      storageKey(featureId),
      JSON.stringify({ mode: state.mode, collapsed: state.collapsed }),
    )
  } catch {
    // localStorage may be disabled or quota-exceeded — fail silent
  }
}

const DEFAULT_STATE: FeaturePanelState = {
  mode: "inspector",
  collapsed: true,
  mounted: false,
}

export const useRightPanelStore = create<RightPanelStore>((set, get) => ({
  panels: {},

  mount: (featureId, init = {}) => {
    const persisted = readPersisted(featureId)
    set((s) => ({
      panels: {
        ...s.panels,
        [featureId]: {
          ...DEFAULT_STATE,
          ...init,
          ...persisted,
          mounted: true,
        },
      },
    }))
  },

  unmount: (featureId) => {
    set((s) => {
      const next = { ...s.panels }
      const existing = next[featureId]
      if (existing) next[featureId] = { ...existing, mounted: false }
      return { panels: next }
    })
  },

  setMode: (featureId, mode) => {
    set((s) => {
      const cur = s.panels[featureId] ?? DEFAULT_STATE
      const next = { ...cur, mode }
      writePersisted(featureId, next)
      return { panels: { ...s.panels, [featureId]: next } }
    })
  },

  setCollapsed: (featureId, collapsed) => {
    set((s) => {
      const cur = s.panels[featureId] ?? DEFAULT_STATE
      const next = { ...cur, collapsed }
      writePersisted(featureId, next)
      return { panels: { ...s.panels, [featureId]: next } }
    })
  },

  toggleCollapsed: (featureId) => {
    const cur = get().panels[featureId] ?? DEFAULT_STATE
    get().setCollapsed(featureId, !cur.collapsed)
  },

  openTab: (featureId, mode) => {
    set((s) => {
      const cur = s.panels[featureId] ?? DEFAULT_STATE
      const next = { ...cur, mode, collapsed: false }
      writePersisted(featureId, next)
      return { panels: { ...s.panels, [featureId]: next } }
    })
  },
}))

/**
 * Mount/unmount helper for FeatureShell. Registers featureId in the
 * store so the global header trigger knows the panel is reachable.
 */
export function useRightPanelMount(
  featureId: string,
  init?: Partial<FeaturePanelState>,
): void {
  const mount = useRightPanelStore((s) => s.mount)
  const unmount = useRightPanelStore((s) => s.unmount)
  React.useEffect(() => {
    mount(featureId, init)
    return () => {
      unmount(featureId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureId])
}

/** Reactive subscription to a feature's panel state. */
export function useRightPanelState(featureId: string): FeaturePanelState {
  return useRightPanelStore(
    (s) => s.panels[featureId] ?? DEFAULT_STATE,
  )
}

/** Returns true when the named feature has an active FeatureShell mounted. */
export function useIsFeaturePanelMounted(featureId: string | undefined | null): boolean {
  return useRightPanelStore((s) =>
    featureId ? Boolean(s.panels[featureId]?.mounted) : false,
  )
}

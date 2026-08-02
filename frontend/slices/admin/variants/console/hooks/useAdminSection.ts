"use client"

import * as React from "react"
import type { AdminConsoleSection } from "../lib/sections"

const PARAM = "section"

function readParam(): string | null {
  if (typeof window === "undefined") return null
  return new URLSearchParams(window.location.search).get(PARAM)
}

/**
 * Active-section state with URL sync via the History API (no router dep — works
 * in any host). Defaults to the first visible section; keeps `?section=<id>` in
 * the address bar so the console is deep-linkable and back/forward works.
 */
export function useAdminSection(visible: readonly AdminConsoleSection[]) {
  const ids = visible.map((s) => s.id)
  const [activeId, setActiveId] = React.useState<string>(() => readParam() ?? ids[0] ?? "")

  // Keep active valid as visibility changes; adopt URL param on mount.
  React.useEffect(() => {
    const fromUrl = readParam()
    if (fromUrl && ids.includes(fromUrl)) setActiveId(fromUrl)
    else if (!ids.includes(activeId) && ids.length) setActiveId(ids[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")])

  // Reflect back/forward navigation.
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const onPop = () => {
      const p = readParam()
      if (p && ids.includes(p)) setActiveId(p)
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")])

  const navigate = React.useCallback((id: string) => {
    setActiveId(id)
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    url.searchParams.set(PARAM, id)
    window.history.pushState({}, "", url)
  }, [])

  return { activeId, navigate }
}

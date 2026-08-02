"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const SHIM_REMOVAL_DATE = "2026-06-19"
const WARNED_SLICES = new Set<string>()

function daysUntil(target: string): number {
  const t = new Date(target).getTime()
  const now = Date.now()
  return Math.max(0, Math.ceil((t - now) / (1000 * 60 * 60 * 24)))
}

interface DeprecationBannerProps {
  /** Source slice slug (e.g. "menu-store", "workspace-store"). */
  sliceId: string
  /** Display name in the headline. */
  sliceName: string
  /** Target URL for the "open new editor" CTA. */
  replacementHref: string
  /** Optional override for the replacement label. */
  replacementName?: string
  /** Override target removal date (default: 2026-06-19). */
  removalDate?: string
  /** Allow user-dismiss (persists in localStorage). */
  dismissable?: boolean
  className?: string
}

/**
 * DeprecationBanner — sticky top-of-page banner for legacy editors during
 * the 30-day transition window before the cleanup commit on 2026-06-19.
 *
 * - Fires console.warn ONCE per slice per session (prod + dev)
 * - User-dismissable per slice (persists `superspace.deprec.dismiss.<sliceId>`
 *   in localStorage)
 * - Shows days-remaining countdown
 * - CTA links to the replacement editor
 */
export function DeprecationBanner({
  sliceId,
  sliceName,
  replacementHref,
  replacementName = "Workspace Shell",
  removalDate = SHIM_REMOVAL_DATE,
  dismissable = true,
  className,
}: DeprecationBannerProps) {
  const storageKey = `superspace.deprec.dismiss.${sliceId}`

  const [dismissed, setDismissed] = React.useState(false)

  // Hydrate dismiss state from localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const v = window.localStorage.getItem(storageKey)
      if (v === "1") setDismissed(true)
    } catch {}
  }, [storageKey])

  // Console warning, once per slice per session
  React.useEffect(() => {
    if (WARNED_SLICES.has(sliceId)) return
    WARNED_SLICES.add(sliceId)
    const days = daysUntil(removalDate)
    // eslint-disable-next-line no-console
    console.warn(
      `[deprecated] ${sliceName} (${sliceId}) is deprecated. ` +
        `Will be removed on ${removalDate} (${days} day${days === 1 ? "" : "s"} remaining). ` +
        `Use ${replacementName}: ${replacementHref}`,
    )
  }, [sliceId, sliceName, removalDate, replacementHref, replacementName])

  if (dismissed) return null

  const days = daysUntil(removalDate)

  const handleDismiss = () => {
    setDismissed(true)
    try {
      window.localStorage.setItem(storageKey, "1")
    } catch {}
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-wrap items-center gap-3 border-b border-amber-300/50 bg-amber-50 px-4 py-2 text-sm text-amber-900",
        "dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200",
        className,
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-medium">{sliceName} is deprecated.</span>{" "}
        <span className="text-amber-800 dark:text-amber-300">
          Removing on {removalDate} ({days} day{days === 1 ? "" : "s"} left).
        </span>
      </div>
      <Link
        href={replacementHref}
        className="inline-flex items-center gap-1 rounded-md border border-amber-400/60 bg-amber-100 px-2.5 py-1 text-xs font-medium hover:bg-amber-200 dark:bg-amber-900/40 dark:border-amber-700/60 dark:hover:bg-amber-900/70"
      >
        Open {replacementName}
        <ArrowRight className="h-3 w-3" />
      </Link>
      {dismissable && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="rounded p-1 hover:bg-amber-200/60 dark:hover:bg-amber-900/40"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

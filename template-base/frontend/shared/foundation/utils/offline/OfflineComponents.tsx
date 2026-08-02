"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { WifiOff, RefreshCw, CloudOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOffline, useIsOffline, usePendingSyncCount } from "./OfflineProvider"

// ============================================================================
// Offline Indicator
// ============================================================================

interface OfflineIndicatorProps {
  /** Position of the indicator */
  position?: "top" | "bottom"
  /** Show pending sync count */
  showPendingCount?: boolean
  /** Custom className */
  className?: string
}

/**
 * Visual indicator shown when the app is offline
 */
export function OfflineIndicator({
  position = "bottom",
  showPendingCount = true,
  className,
}: OfflineIndicatorProps) {
  const isOffline = useIsOffline()
  const pendingCount = usePendingSyncCount()
  
  if (!isOffline) return null

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50",
        "flex items-center justify-center gap-2 px-4 py-2",
        "bg-amber-500 text-amber-950",
        "text-sm font-medium",
        position === "top" ? "top-0" : "bottom-0",
        className
      )}
    >
      <WifiOff className="h-4 w-4" />
      <span>You&apos;re offline</span>
      {showPendingCount && pendingCount > 0 && (
        <span className="text-amber-800">
          • {pendingCount} pending {pendingCount === 1 ? "change" : "changes"}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// Offline Banner
// ============================================================================

interface OfflineBannerProps {
  /** Called when user clicks retry */
  onRetry?: () => void
  /** Custom className */
  className?: string
}

/**
 * Banner shown at the top of the page when offline
 */
export function OfflineBanner({ onRetry, className }: OfflineBannerProps) {
  const { isOffline, pendingSyncCount, syncPending } = useOffline()
  const [isSyncing, setIsSyncing] = React.useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncPending()
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isOffline && pendingSyncCount === 0) return null

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-4 py-2",
        "border-b",
        isOffline 
          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20" 
          : "bg-blue-50 border-blue-200 dark:bg-blue-950/20",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isOffline ? (
          <>
            <CloudOff className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800 dark:text-amber-200">
              You&apos;re working offline
            </span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              {pendingSyncCount} {pendingSyncCount === 1 ? "change" : "changes"} to sync
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isOffline && pendingSyncCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Sync now
          </Button>
        )}
        {onRetry && isOffline && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Offline Fallback
// ============================================================================

interface OfflineFallbackProps {
  /** Title text */
  title?: string
  /** Description text */
  description?: string
  /** Called when user clicks retry */
  onRetry?: () => void
  /** Custom className */
  className?: string
}

/**
 * Full-page fallback shown when content can't be loaded offline
 */
export function OfflineFallback({
  title = "You're offline",
  description = "Some features may not be available. Please check your connection and try again.",
  onRetry,
  className,
}: OfflineFallbackProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] p-8",
        "text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <WifiOff className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      
      {onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// Offline Gate
// ============================================================================

interface OfflineGateProps {
  /** Content to show when online */
  children: React.ReactNode
  /** Content to show when offline (defaults to OfflineFallback) */
  fallback?: React.ReactNode
  /** Whether to show cached content when offline */
  showCached?: boolean
}

/**
 * Conditionally renders content based on online status
 */
export function OfflineGate({ 
  children, 
  fallback,
  showCached = false 
}: OfflineGateProps) {
  const isOffline = useIsOffline()
  
  if (isOffline && !showCached) {
    return <>{fallback ?? <OfflineFallback />}</>
  }
  
  return <>{children}</>
}

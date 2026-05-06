"use client"

import * as React from "react"
import {
  getOnlineStatus,
  supportsOnlineStatus,
  getPendingSyncQueue,
  processPendingSync,
  type NetworkStatus,
  type OfflineState,
  type PendingSyncItem,
} from "./offline-utils"

// ============================================================================
// Offline Context
// ============================================================================

interface OfflineContextValue extends OfflineState {
  /** Force check network status */
  checkStatus: () => Promise<void>
  /** Process pending sync queue */
  syncPending: () => Promise<{ success: number; failed: number }>
}

const OfflineContext = React.createContext<OfflineContextValue | null>(null)

// ============================================================================
// Offline Provider
// ============================================================================

interface OfflineProviderProps {
  children: React.ReactNode
  /** Custom sync processor */
  onProcessSync?: (item: PendingSyncItem) => Promise<boolean>
  /** Called when coming back online */
  onOnline?: () => void
  /** Called when going offline */
  onOffline?: () => void
}

export function OfflineProvider({
  children,
  onProcessSync,
  onOnline,
  onOffline,
}: OfflineProviderProps) {
  const [state, setState] = React.useState<OfflineState>({
    status: "online",
    isOffline: false,
    isSlow: false,
    lastOnline: Date.now(),
    pendingSyncCount: 0,
  })

  // Update pending sync count
  const updatePendingCount = React.useCallback(() => {
    const queue = getPendingSyncQueue()
    setState((prev) => ({
      ...prev,
      pendingSyncCount: queue.length,
    }))
  }, [])

  // Check network status
  const checkStatus = React.useCallback(async () => {
    const isOnline = getOnlineStatus()
    
    setState((prev) => ({
      ...prev,
      status: isOnline ? "online" : "offline",
      isOffline: !isOnline,
      lastOnline: isOnline ? Date.now() : prev.lastOnline,
    }))

    updatePendingCount()
  }, [updatePendingCount])

  // Process pending sync
  const syncPending = React.useCallback(async () => {
    if (!onProcessSync) {
      return { success: 0, failed: 0 }
    }

    const result = await processPendingSync(onProcessSync)
    updatePendingCount()
    return result
  }, [onProcessSync, updatePendingCount])

  // Listen to online/offline events
  React.useEffect(() => {
    if (!supportsOnlineStatus()) return

    const handleOnline = () => {
      setState((prev) => ({
        ...prev,
        status: "online",
        isOffline: false,
        lastOnline: Date.now(),
      }))
      onOnline?.()
      
      // Auto-sync when back online
      if (onProcessSync) {
        syncPending()
      }
    }

    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        status: "offline",
        isOffline: true,
      }))
      onOffline?.()
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Initial check
    checkStatus()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [onOnline, onOffline, onProcessSync, checkStatus, syncPending])

  // Periodic check for pending items
  React.useEffect(() => {
    const interval = setInterval(updatePendingCount, 5000)
    return () => clearInterval(interval)
  }, [updatePendingCount])

  const value: OfflineContextValue = {
    ...state,
    checkStatus,
    syncPending,
  }

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  )
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access offline state and utilities
 */
export function useOffline(): OfflineContextValue {
  const context = React.useContext(OfflineContext)
  if (!context) {
    throw new Error("useOffline must be used within an OfflineProvider")
  }
  return context
}

/**
 * Hook that returns whether the app is currently offline
 */
export function useIsOffline(): boolean {
  const context = React.useContext(OfflineContext)
  
  // If no provider, fall back to navigator.onLine
  const [isOffline, setIsOffline] = React.useState(() => !getOnlineStatus())
  
  React.useEffect(() => {
    if (context) return // Using context instead
    
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [context])
  
  return context?.isOffline ?? isOffline
}

/**
 * Hook for network status
 */
export function useNetworkStatus(): NetworkStatus {
  const context = React.useContext(OfflineContext)
  
  const [status, setStatus] = React.useState<NetworkStatus>(() => 
    getOnlineStatus() ? "online" : "offline"
  )
  
  React.useEffect(() => {
    if (context) return
    
    const handleOnline = () => setStatus("online")
    const handleOffline = () => setStatus("offline")
    
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [context])
  
  return context?.status ?? status
}

/**
 * Hook for pending sync count
 */
export function usePendingSyncCount(): number {
  const context = React.useContext(OfflineContext)
  return context?.pendingSyncCount ?? getPendingSyncQueue().length
}

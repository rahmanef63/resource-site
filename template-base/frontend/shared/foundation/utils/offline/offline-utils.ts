/**
 * Offline Shell Mode
 * 
 * Provides offline detection, caching strategies, and graceful degradation
 * for the application shell when network connectivity is lost.
 */

// ============================================================================
// Types
// ============================================================================

export type NetworkStatus = "online" | "offline" | "slow"

export interface OfflineShellConfig {
  /** Enable offline mode detection */
  enabled?: boolean
  /** Show offline indicator in UI */
  showIndicator?: boolean
  /** Cache shell assets */
  cacheShell?: boolean
  /** Sync pending changes when back online */
  syncOnReconnect?: boolean
  /** Custom offline fallback component */
  fallbackComponent?: React.ComponentType
}

export interface OfflineState {
  /** Current network status */
  status: NetworkStatus
  /** Whether currently offline */
  isOffline: boolean
  /** Whether connection is slow */
  isSlow: boolean
  /** Last online timestamp */
  lastOnline: number | null
  /** Pending sync items count */
  pendingSyncCount: number
}

export interface PendingSyncItem {
  id: string
  type: "mutation" | "query"
  action: string
  data: unknown
  timestamp: number
  retryCount: number
}

// ============================================================================
// Constants
// ============================================================================

export const OFFLINE_STORAGE_KEY = "superspace-offline-queue"
export const OFFLINE_CACHE_NAME = "superspace-shell-cache-v1"

// Assets to cache for offline shell
export const SHELL_ASSETS = [
  "/dashboard",
  "/offline",
  // Add other critical paths
]

let offlineRegistrationPromise: Promise<ServiceWorkerRegistration | null> | null = null

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if the browser supports service workers
 */
export function supportsServiceWorker(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator
}

/**
 * Check if the browser supports online/offline events
 */
export function supportsOnlineStatus(): boolean {
  return typeof window !== "undefined" && "onLine" in navigator
}

/**
 * Get current online status
 */
export function getOnlineStatus(): boolean {
  if (typeof window === "undefined") return true
  return navigator.onLine
}

/**
 * Measure connection speed (approximate)
 */
export async function measureConnectionSpeed(): Promise<NetworkStatus> {
  if (!getOnlineStatus()) return "offline"
  
  try {
    const start = Date.now()
    const response = await fetch("/api/ping", { 
      method: "HEAD",
      cache: "no-store" 
    })
    const duration = Date.now() - start
    
    if (!response.ok) return "slow"
    if (duration > 3000) return "slow"
    return "online"
  } catch {
    return "offline"
  }
}

// ============================================================================
// Pending Sync Queue
// ============================================================================

/**
 * Add item to offline sync queue
 */
export function addToPendingSync(item: Omit<PendingSyncItem, "id" | "timestamp" | "retryCount">): void {
  if (typeof window === "undefined") return
  
  try {
    const queue = getPendingSyncQueue()
    const newItem: PendingSyncItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    }
    queue.push(newItem)
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error("Failed to add to offline queue:", error)
  }
}

/**
 * Get pending sync queue
 */
export function getPendingSyncQueue(): PendingSyncItem[] {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Remove item from pending sync queue
 */
export function removeFromPendingSync(itemId: string): void {
  if (typeof window === "undefined") return
  
  try {
    const queue = getPendingSyncQueue().filter(item => item.id !== itemId)
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error("Failed to remove from offline queue:", error)
  }
}

/**
 * Clear all pending sync items
 */
export function clearPendingSync(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(OFFLINE_STORAGE_KEY)
}

/**
 * Process pending sync queue (call when back online)
 */
export async function processPendingSync(
  processor: (item: PendingSyncItem) => Promise<boolean>
): Promise<{ success: number; failed: number }> {
  const queue = getPendingSyncQueue()
  let success = 0
  let failed = 0
  
  for (const item of queue) {
    try {
      const result = await processor(item)
      if (result) {
        removeFromPendingSync(item.id)
        success++
      } else {
        // Increment retry count
        item.retryCount++
        failed++
      }
    } catch {
      failed++
    }
  }
  
  return { success, failed }
}

// ============================================================================
// Service Worker Registration
// ============================================================================

/**
 * Register service worker for offline support
 */
export async function registerOfflineServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!supportsServiceWorker()) {
    console.warn("Service workers not supported")
    return null
  }

  if (!offlineRegistrationPromise) {
    offlineRegistrationPromise = navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    }).catch((error) => {
      offlineRegistrationPromise = null
      console.error("Service worker registration failed:", error)
      return null
    })
  }

  return offlineRegistrationPromise
}

/**
 * Unregister service worker
 */
export async function unregisterOfflineServiceWorker(): Promise<boolean> {
  if (!supportsServiceWorker()) return false
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map(reg => reg.unregister()))
    return true
  } catch (error) {
    console.error("Failed to unregister service workers:", error)
    return false
  }
}

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Pre-cache shell assets
 */
export async function precacheShellAssets(): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return false
  }
  
  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME)
    await cache.addAll(SHELL_ASSETS)
    return true
  } catch (error) {
    console.error("Failed to precache shell assets:", error)
    return false
  }
}

/**
 * Clear shell cache
 */
export async function clearShellCache(): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window)) {
    return false
  }
  
  try {
    return await caches.delete(OFFLINE_CACHE_NAME)
  } catch (error) {
    console.error("Failed to clear shell cache:", error)
    return false
  }
}

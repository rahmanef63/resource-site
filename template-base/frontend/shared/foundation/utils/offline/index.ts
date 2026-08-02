/**
 * Offline Shell Mode System
 * 
 * Provides offline detection, caching, and graceful degradation
 * for the application shell.
 */

// Utilities
export {
  supportsServiceWorker,
  supportsOnlineStatus,
  getOnlineStatus,
  measureConnectionSpeed,
  addToPendingSync,
  getPendingSyncQueue,
  removeFromPendingSync,
  clearPendingSync,
  processPendingSync,
  registerOfflineServiceWorker,
  unregisterOfflineServiceWorker,
  precacheShellAssets,
  clearShellCache,
  OFFLINE_STORAGE_KEY,
  OFFLINE_CACHE_NAME,
  SHELL_ASSETS,
} from "./offline-utils"
export type {
  NetworkStatus,
  OfflineShellConfig,
  OfflineState,
  PendingSyncItem,
} from "./offline-utils"

// Provider and Hooks
export {
  OfflineProvider,
  useOffline,
  useIsOffline,
  useNetworkStatus,
  usePendingSyncCount,
} from "./OfflineProvider"

// Components
export {
  OfflineIndicator,
  OfflineBanner,
  OfflineFallback,
  OfflineGate,
} from "./OfflineComponents"

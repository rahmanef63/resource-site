/**
 * Create Feature Store
 * 
 * Factory function for creating Zustand stores with common patterns:
 * - DevTools integration
 * - Optional persistence
 * - Immer middleware for immutable updates
 */

import { create, StateCreator, StoreApi, UseBoundStore } from "zustand"
import { devtools, persist, PersistOptions } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import type { FeatureStoreOptions } from "./types"

/**
 * Create a feature store with standard middleware
 * 
 * @example
 * ```ts
 * interface MyStoreState {
 *   items: string[]
 *   addItem: (item: string) => void
 * }
 * 
 * const useMyStore = createFeatureStore<MyStoreState>(
 *   "my-store",
 *   (set) => ({
 *     items: [],
 *     addItem: (item) => set((state) => { state.items.push(item) }),
 *   }),
 *   { persist: true }
 * )
 * ```
 */
export function createFeatureStore<T extends object>(
  name: string,
  initializer: StateCreator<T, [], []>,
  options: Partial<FeatureStoreOptions> = {}
): UseBoundStore<StoreApi<T>> {
  const {
    persist: shouldPersist = false,
    persistKey,
    devtools: enableDevtools = process.env.NODE_ENV !== "production",
  } = options

  // Build the store with middleware chain
  // Using any casts due to complex middleware type interactions
  let storeCreator: any = immer(initializer as any)

  // Add devtools if enabled
  if (enableDevtools) {
    storeCreator = devtools(storeCreator, { name })
  }

  // Add persistence if enabled
  if (shouldPersist) {
    const persistOptions: PersistOptions<T> = {
      name: persistKey || `${name}-storage`,
      // Only persist serializable data
      partialize: (state) => {
        const serializable: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(state as object)) {
          // Skip functions and non-serializable values
          if (typeof value !== "function" && !(value instanceof Map) && !(value instanceof Set)) {
            serializable[key] = value
          }
        }
        return serializable as T
      },
    }
    storeCreator = persist(storeCreator, persistOptions)
  }

  return create<T>()(storeCreator)
}

/**
 * Create a simple store without immer (for simpler state)
 */
export function createSimpleStore<T extends object>(
  name: string,
  initializer: StateCreator<T, [], []>,
  options: Partial<FeatureStoreOptions> = {}
): UseBoundStore<StoreApi<T>> {
  const {
    persist: shouldPersist = false,
    persistKey,
    devtools: enableDevtools = process.env.NODE_ENV !== "production",
  } = options

  let storeCreator: any = initializer

  if (enableDevtools) {
    storeCreator = devtools(storeCreator, { name })
  }

  if (shouldPersist) {
    const persistOptions: PersistOptions<T> = {
      name: persistKey || `${name}-storage`,
    }
    storeCreator = persist(storeCreator, persistOptions)
  }

  return create<T>()(storeCreator)
}

/**
 * Create selectors for a store
 * 
 * @example
 * ```ts
 * const selectors = createSelectors(useMyStore)
 * const items = selectors.use.items()
 * ```
 */
export function createSelectors<T extends object>(store: UseBoundStore<StoreApi<T>>) {
  const selectors: Record<string, () => unknown> = {}
  
  // Get the initial state to discover keys
  const state = store.getState()
  
  for (const key of Object.keys(state)) {
    selectors[key] = () => store((s) => (s as Record<string, unknown>)[key])
  }
  
  return {
    use: selectors as { [K in keyof T]: () => T[K] },
    store,
  }
}

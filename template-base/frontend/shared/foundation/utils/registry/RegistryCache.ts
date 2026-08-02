/**
 * Registry Cache
 * Caches registry data for faster loading
 */

import type { IRegistryCache } from "../../types"

export class RegistryCache implements IRegistryCache {
  private cache = new Map<string, any>()
  private ttl = new Map<string, number>() // Time to live
  private maxAge: number // milliseconds

  constructor(options: { maxAge?: number } = {}) {
    this.maxAge = options.maxAge || 1000 * 60 * 60 // Default: 1 hour
  }

  /**
   * Get value from cache
   */
  get(key: string): any | undefined {
    // Check if expired
    const expiresAt = this.ttl.get(key)
    if (expiresAt && Date.now() > expiresAt) {
      this.delete(key)
      return undefined
    }

    return this.cache.get(key)
  }

  /**
   * Set value in cache
   */
  set(key: string, value: any, maxAge?: number): void {
    this.cache.set(key, value)

    // Set expiration
    const age = maxAge ?? this.maxAge
    if (age > 0) {
      this.ttl.set(key, Date.now() + age)
    }
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    // Check if expired
    const expiresAt = this.ttl.get(key)
    if (expiresAt && Date.now() > expiresAt) {
      this.delete(key)
      return false
    }

    return this.cache.has(key)
  }

  /**
   * Delete key from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
    this.ttl.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
    this.ttl.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Serialize cache to JSON string
   */
  serialize(): string {
    const data = {
      cache: Array.from(this.cache.entries()),
      ttl: Array.from(this.ttl.entries()),
      maxAge: this.maxAge,
    }
    return JSON.stringify(data)
  }

  /**
   * Deserialize cache from JSON string
   */
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data)

      this.cache.clear()
      this.ttl.clear()

      if (parsed.cache) {
        for (const [key, value] of parsed.cache) {
          this.cache.set(key, value)
        }
      }

      if (parsed.ttl) {
        for (const [key, expiresAt] of parsed.ttl) {
          // Only restore if not expired
          if (Date.now() < expiresAt) {
            this.ttl.set(key, expiresAt)
          } else {
            this.cache.delete(key)
          }
        }
      }

      if (parsed.maxAge) {
        this.maxAge = parsed.maxAge
      }
    } catch (error) {
      console.error("Failed to deserialize cache:", error)
      this.clear()
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.ttl.forEach((expiresAt, key) => {
      if (now > expiresAt) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.delete(key))
  }

  /**
   * Get cache statistics
   */
  stats(): {
    size: number
    expired: number
    memoryUsage: number
  } {
    let expired = 0
    const now = Date.now()

    this.ttl.forEach((expiresAt) => {
      if (now > expiresAt) {
        expired++
      }
    })

    // Approximate memory usage
    const memoryUsage = new Blob([this.serialize()]).size

    return {
      size: this.cache.size,
      expired,
      memoryUsage,
    }
  }
}

// ============================================================================
// Persistent Cache (using localStorage)
// ============================================================================

export class PersistentRegistryCache extends RegistryCache {
  constructor(
    private storageKey: string = "registry-cache",
    options: { maxAge?: number } = {}
  ) {
    super(options)
    this.load()
  }

  /**
   * Save cache to localStorage
   */
  save(): void {
    try {
      const data = this.serialize()
      localStorage.setItem(this.storageKey, data)
    } catch (error) {
      console.error("Failed to save cache to localStorage:", error)
    }
  }

  /**
   * Load cache from localStorage
   */
  load(): void {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        this.deserialize(data)
      }
    } catch (error) {
      console.error("Failed to load cache from localStorage:", error)
    }
  }

  /**
   * Override set to auto-save
   */
  override set(key: string, value: any, maxAge?: number): void {
    super.set(key, value, maxAge)
    this.save()
  }

  /**
   * Override delete to auto-save
   */
  override delete(key: string): void {
    super.delete(key)
    this.save()
  }

  /**
   * Override clear to auto-save
   */
  override clear(): void {
    super.clear()
    localStorage.removeItem(this.storageKey)
  }
}

// ============================================================================
// Memory Cache (in-memory only, faster)
// ============================================================================

export class MemoryRegistryCache extends RegistryCache {
  // Same as RegistryCache but explicitly named for clarity
}

// ============================================================================
// Helper Functions
// ============================================================================

let globalCache: IRegistryCache | null = null

export function getGlobalCache(): IRegistryCache {
  if (!globalCache) {
    // Use persistent cache in browser, memory cache in server
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      globalCache = new PersistentRegistryCache()
    } else {
      globalCache = new MemoryRegistryCache()
    }
  }
  return globalCache
}

export function setGlobalCache(cache: IRegistryCache): void {
  globalCache = cache
}

export function clearGlobalCache(): void {
  globalCache?.clear()
}

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
  maxSize?: number;
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const globalCache = new PerformanceCache();

export function usePerformanceCache<T>(
  key: string,
  queryFn: () => T | undefined,
  options: CacheOptions = {}
): {
  data: T | undefined;
  isLoading: boolean;
  isStale: boolean;
  refetch: () => void;
} {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    staleWhileRevalidate = true,
    maxSize = 100,
  } = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const lastFetchRef = useRef<number>(0);

  // Get fresh data from query
  const freshData = queryFn();

  useEffect(() => {
    const cachedData = globalCache.get<T>(key);
    const now = Date.now();

    if (cachedData && staleWhileRevalidate) {
      // Use cached data immediately
      setData(cachedData);
      setIsLoading(false);
      
      // Check if data is stale
      const entry = globalCache['cache'].get(key);
      if (entry && now - entry.timestamp > ttl / 2) {
        setIsStale(true);
      }
    }

    // Update with fresh data when available
    if (freshData !== undefined) {
      setData(freshData);
      setIsLoading(false);
      setIsStale(false);
      
      // Cache the fresh data
      globalCache.set(key, freshData, ttl);
      lastFetchRef.current = now;
    } else if (!cachedData) {
      setIsLoading(true);
    }
  }, [key, freshData, ttl, staleWhileRevalidate]);

  const refetch = () => {
    globalCache.clear();
    setIsLoading(true);
    setIsStale(false);
  };

  return {
    data,
    isLoading,
    isStale,
    refetch,
  };
}

export function useCachedQuery<T>(
  queryFn: () => T | undefined,
  key: string,
  options?: CacheOptions
) {
  return usePerformanceCache(key, queryFn, options);
}

// Hook for managing cache globally
export function useGlobalCache() {
  return {
    clear: () => globalCache.clear(),
    size: () => globalCache.size(),
    has: (key: string) => globalCache.has(key),
  };
}

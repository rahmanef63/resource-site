/**
 * Performance Utilities
 * Helper functions for performance optimization
 */

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Measure execution time
 */
export async function measureTime<T>(
  fn: () => T | Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start

  if (label) {
    console.log(`${label}: ${duration.toFixed(2)}ms`)
  }

  return { result, duration }
}

/**
 * Retry a function with exponential backoff
 */
interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  onRetry?: (error: Error, attempt: number) => void
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, onRetry } = options

  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) {
        throw lastError
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      onRetry?.(lastError, attempt + 1)
      await sleep(delay)
    }
  }

  throw lastError!
}

/**
 * Request Idle Callback polyfill
 */
export function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, options)
  }

  // Fallback using setTimeout
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50,
    })
  }, 1) as unknown as number
}

/**
 * Cancel Idle Callback polyfill
 */
export function cancelIdleCallback(handle: number): void {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    window.cancelIdleCallback(handle)
  } else {
    clearTimeout(handle)
  }
}

/**
 * Batch multiple calls into one
 */
export function batch<T extends (...args: any[]) => void>(
  fn: T,
  delay = 0
): T {
  let queued = false
  let lastArgs: Parameters<T>

  return function (this: any, ...args: Parameters<T>) {
    lastArgs = args

    if (!queued) {
      queued = true
      requestAnimationFrame(() => {
        if (delay > 0) {
          setTimeout(() => {
            fn.apply(this, lastArgs)
            queued = false
          }, delay)
        } else {
          fn.apply(this, lastArgs)
          queued = false
        }
      })
    }
  } as T
}

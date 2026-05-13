import { useEffect, useState } from "react"

/**
 * Debounce a value by `delay` ms. Returns the latest value after no changes
 * for `delay` ms. Safe for SSR — initial render returns the initial value.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}

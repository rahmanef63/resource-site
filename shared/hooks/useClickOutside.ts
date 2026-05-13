import { useEffect, type RefObject } from "react"

type AnyEvent = MouseEvent | TouchEvent

/**
 * Invoke `handler` when a pointer event lands outside the ref'd element.
 * Listens for mousedown + touchstart on document. SSR-safe.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: AnyEvent) => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return
    const listener = (event: AnyEvent) => {
      const el = ref.current
      if (!el || el.contains(event.target as Node)) return
      handler(event)
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener, { passive: true })
    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler, enabled])
}

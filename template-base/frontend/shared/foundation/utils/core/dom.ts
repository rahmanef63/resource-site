/**
 * DOM Utilities
 * Helper functions for DOM manipulation
 */

/**
 * Check if code is running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined"
}

/**
 * Get element by ID safely
 */
export function getElement<T extends HTMLElement = HTMLElement>(
  id: string
): T | null {
  if (!isBrowser()) return null
  return document.getElementById(id) as T | null
}

/**
 * Query selector with type safety
 */
export function querySelector<T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: ParentNode = document
): T | null {
  if (!isBrowser()) return null
  return parent.querySelector<T>(selector)
}

/**
 * Query selector all with type safety
 */
export function querySelectorAll<T extends HTMLElement = HTMLElement>(
  selector: string,
  parent: ParentNode = document
): NodeListOf<T> | null {
  if (!isBrowser()) return null
  return parent.querySelectorAll<T>(selector)
}

/**
 * Scroll element into view smoothly
 */
export function scrollIntoView(
  element: HTMLElement | null,
  options: ScrollIntoViewOptions = { behavior: "smooth", block: "center" }
): void {
  element?.scrollIntoView(options)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser()) return false
  
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.select()
    
    try {
      document.execCommand("copy")
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

/**
 * Focus element with retry
 */
export function focusElement(
  element: HTMLElement | null,
  retryDelay = 100,
  maxRetries = 3
): void {
  if (!element) return

  let retries = 0
  const tryFocus = () => {
    element.focus()
    if (document.activeElement !== element && retries < maxRetries) {
      retries++
      setTimeout(tryFocus, retryDelay)
    }
  }
  tryFocus()
}

/**
 * Get scroll position
 */
export function getScrollPosition(): { x: number; y: number } {
  if (!isBrowser()) return { x: 0, y: 0 }
  return {
    x: window.scrollX || document.documentElement.scrollLeft,
    y: window.scrollY || document.documentElement.scrollTop,
  }
}

/**
 * Scroll to top
 */
export function scrollToTop(smooth = true): void {
  if (!isBrowser()) return
  window.scrollTo({
    top: 0,
    behavior: smooth ? "smooth" : "auto",
  })
}

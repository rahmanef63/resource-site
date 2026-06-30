// DOMPurify seam — injected, never imported. The slice ships the contract, not
// the dependency: call configureRichtextSanitizer(DOMPurify) once at startup to
// enable rich HTML/SVG output. Without it, sanitizeRichtext strips ALL tags and
// sanitizeSvg refuses (fail-closed). Keeps the engine env-agnostic (Node /
// browser / workerd) and dependency-free.

export interface SanitizerConfig {
  [key: string]: unknown;
  /** Sentinel: triggers a regex post-strip pass in sanitizeRichtext. */
  _plainText?: true;
}

interface DOMPurifyHookNode {
  tagName?: string;
  setAttribute?: (name: string, value: string) => void;
}

/** Minimal structural type for a DOMPurify-compatible runtime. */
export interface DOMPurifyRuntime {
  sanitize?: (value: string, config?: SanitizerConfig) => unknown;
  addHook?: (
    hookName: "afterSanitizeAttributes",
    callback: (node: DOMPurifyHookNode) => void,
  ) => void;
}

let activeRuntime: DOMPurifyRuntime | null = null;
const hooked = new WeakSet<object>();

// Force every sanitised <a> to open safely (target=_blank + noopener).
function installLinkHook(purifier: DOMPurifyRuntime): DOMPurifyRuntime {
  if (!hooked.has(purifier) && typeof purifier.addHook === "function") {
    purifier.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A") {
        node.setAttribute?.("target", "_blank");
        node.setAttribute?.("rel", "noopener noreferrer");
      }
    });
    hooked.add(purifier);
  }
  return purifier;
}

/** Install (or clear) the DOMPurify runtime used by sanitizeRichtext/sanitizeSvg. */
export function configureRichtextSanitizer(purifier: DOMPurifyRuntime | null): void {
  activeRuntime = purifier ? installLinkHook(purifier) : null;
}

export function getDOMPurify(): DOMPurifyRuntime | null {
  if (activeRuntime && typeof activeRuntime.sanitize === "function") {
    return installLinkHook(activeRuntime);
  }
  return null;
}

/** Conservative fallback when no runtime is configured: strip every tag. */
export function stripHtmlFallback(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<[^>]*>/g, "");
}

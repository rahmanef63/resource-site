// CssCollector — accumulate module CSS, deduplicated by moduleId (first-write-
// wins). A page with 50 `text` instances emits one `text` CSS block, not 50 —
// ~60-80% CSS shrink vs naive concat. Lifted from Instatic
// `src/core/publisher/cssCollector.ts` (dropped collectClassCSS, which needs the
// site style-rule engine; the host passes pre-built class CSS to publishPage).

/**
 * Neutralise any `</style` sequence before injecting CSS into a `<style>` block.
 *
 * A module returning `css: 'h1{}</style><script>…'` would break out of the
 * style block. The HTML5 RAWTEXT tokenizer ends `<style>` on `</style` followed
 * by whitespace / `/` / `>`, so a `</style\s*>` strip misses `</style/>` forms.
 * Inserting a backslash (`</style` → `<\/style`) keeps the parser in RAWTEXT for
 * every trailer; CSS string literals resolve `\/` back to `/`, so URL values
 * round-trip. (CWE-79.)
 */
export function sanitizeModuleCSS(css: string): string {
  return css.replace(/<\/style/gi, "<\\/style");
}

export class CssCollector {
  private readonly seen = new Map<string, string>();

  /** Add CSS for a module type. First write per moduleId wins; CSS is sanitised. */
  add(moduleId: string, css: string): void {
    if (!this.seen.has(moduleId)) {
      this.seen.set(moduleId, sanitizeModuleCSS(css));
    }
  }

  /** All collected CSS joined into one string. */
  collect(): string {
    return Array.from(this.seen.values()).join("\n");
  }

  /** Number of unique module types that contributed CSS. */
  get size(): number {
    return this.seen.size;
  }

  get isEmpty(): boolean {
    return this.seen.size === 0;
  }

  clear(): void {
    this.seen.clear();
  }
}

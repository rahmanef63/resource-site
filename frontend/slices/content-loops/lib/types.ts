// Content Loops — portable types for the pluggable repeater.
//
// Lifted + decoupled from Instatic `src/core/loops/types.ts`. Stripped the
// publisher-only machinery (SiteDocument, PropertySchema, request/perVisitor
// hole context, TypeBox) so the contract is framework-agnostic: a source
// declares its fields + an async fetch, consumers register sources and render
// <ContentLoop>. The shape stays generic so the same render path handles any
// source (Convex rows, REST, in-memory mock, …).

/** One field a source exposes for binding inside a loop variant. */
export interface LoopSourceField {
  id: string;
  label: string;
  description?: string;
  /**
   * Rendering hint for the consumer's variant:
   *  - 'plain' (default): treat as a string
   *  - 'html'           : already-rendered, trusted HTML
   *  - 'url'            : a hyperlink target
   *  - 'media'          : a URL pointing at a media asset
   */
  format?: "plain" | "html" | "url" | "media";
}

/**
 * A single item produced by a source. `fields` holds RESOLVED values keyed by
 * `LoopSourceField.id` — never ids that need a second lookup (resolve media
 * paths / author names inside the source's fetch()).
 */
export interface LoopItem {
  id: string;
  fields: Record<string, unknown>;
}

/** Resolved query handed to a source's `fetch()`. */
export interface LoopQuery {
  /** Source-specific filter values. */
  filters: Record<string, unknown>;
  /** One of the source's `orderByOptions[].id`. */
  orderBy?: string;
  direction: "asc" | "desc";
  /** Hard cap for this page; the source may clamp further. */
  limit: number;
  offset: number;
}

export interface LoopFetchResult {
  items: LoopItem[];
  /** Total matching across ALL pages — drives hasMore + counters. */
  totalItems: number;
}

/**
 * A pluggable data backend. Namespaced id (`namespace.name`, e.g. `data.rows`)
 * prevents one source from shadowing another. Write your own and register it,
 * or pass it inline to <ContentLoop source={...} />.
 */
export interface LoopEntitySource {
  id: string;
  label: string;
  description?: string;
  fields: LoopSourceField[];
  orderByOptions?: { id: string; label: string }[];
  /** Produce items + totalItems for the resolved filters/page. */
  fetch(query: LoopQuery): Promise<LoopFetchResult>;
}

export interface ILoopSourceRegistry {
  register(source: LoopEntitySource): void;
  registerOrReplace(source: LoopEntitySource): void;
  unregister(id: string): void;
  get(id: string): LoopEntitySource | undefined;
  getOrThrow(id: string): LoopEntitySource;
  has(id: string): boolean;
  list(): LoopEntitySource[];
}

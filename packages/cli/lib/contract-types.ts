/**
 * Slice Composition Compiler — Phase A: typed contract DSL (types only).
 *
 * Extracted from contract.ts so the validator-runtime stays ≤200 LOC. The
 * `defineSliceContract` factory lives in ./contract; this module exposes
 * the supporting type vocabulary.
 *
 * @module packages/cli/lib/contract-types
 */

// ---------------------------------------------------------------------------
// Primitive vocabulary
// ---------------------------------------------------------------------------

/**
 * Identity providers the kitab knows about.
 *
 * The kitab itself only ships `convex` (see CLAUDE.md "NO Clerk"). The other
 * literals exist so consumer projects forking the contract DSL can target
 * a different provider without losing type safety.
 */
export type AuthProvider = "convex" | "clerk" | "next-auth" | "none";

/**
 * RBAC permission string in `domain.action` shape — e.g. `"payment.refund"`.
 *
 * Enforced at compile time via a template-literal type, and at runtime by
 * `defineSliceContract`. The runtime check rejects empty segments and
 * any value with more than one dot.
 */
export type RBACPermission = `${string}.${string}`;

// ---------------------------------------------------------------------------
// `requires` block
// ---------------------------------------------------------------------------

/**
 * Convex table-namespace declaration for a slice.
 *
 * Every Convex table the slice owns must start with {@link prefix}. Operator
 * decision 2026-05-12 mandates per-provider prefixes (e.g. `doku_`, `midtrans_`)
 * to prevent the historical `paymentOrders` collision between sibling
 * payment slices.
 */
export interface ConvexNamespace {
  /** Required prefix — e.g. `"doku_"`. Must match `/^[a-z][a-z0-9_]*_$/`. */
  prefix: string;
  /** Tables this slice declares. Every entry must start with {@link prefix}. */
  tables: string[];
}

/**
 * Capabilities a slice REQUIRES the host application to satisfy before it
 * can be composed in.
 */
export interface SliceContractRequires {
  /** Identity provider the slice expects. Omit when slice is auth-agnostic. */
  auth?: AuthProvider;
  /** RBAC permission strings the slice will call `requirePermission(...)` with. */
  rbac?: RBACPermission[];
  /** Env var names (server scope). Validators read this for `.env.example` drift checks. */
  env?: string[];
  /** Convex table namespace the slice owns. */
  convex?: ConvexNamespace;
  /** Other slice ids that must be installed first. */
  deps?: string[];
}

// ---------------------------------------------------------------------------
// `provides` block
// ---------------------------------------------------------------------------

/**
 * Surface area a slice exposes to the host application + downstream slices.
 *
 * All arrays are optional. Empty / omitted means "nothing exposed in that
 * category". The keys must match the literal segment of a conflict path —
 * `tables`, `routes`, `hooks`, `events`, `components`.
 */
export interface SliceContractProvides {
  /** Next.js route paths the slice mounts — e.g. `["/sign-in", "/sign-out"]`. */
  routes?: string[];
  /** Public hook export names — e.g. `["useDokuCheckout"]`. */
  hooks?: string[];
  /** Convex table names. Must match `requires.convex.prefix` if that is set. */
  tables?: string[];
  /** Event-bus event names the slice emits — e.g. `["payment.captured"]`. */
  events?: string[];
  /** Public component exports — e.g. `["DokuCheckoutButton"]`. */
  components?: string[];
  /**
   * Fully-qualified AI tool names the slice exposes as a `ToolCollection`
   * (`@/shared/agentic`) — e.g. `["image-editor.layer.add"]`. Every entry
   * MUST be prefixed with the slice id so one agent can aggregate tools from
   * many slices without collision. A slice is "agentic-ready" iff this is
   * non-empty.
   */
  tools?: string[];
}

// ---------------------------------------------------------------------------
// Generalisation gate
// ---------------------------------------------------------------------------
// (Formerly nested inside the Wave N+3 `bidir` block. BSDL was removed in
// Sesi 2; the sync policy died with it, but the generalisation contract is
// still consumed by scripts/validation/check-forbidden-terms.mjs — so it
// lives on as a top-level field.)

/**
 * Portability level of the slice source.
 *
 * - `portable`: no consumer-specific business terms baked in.
 * - `needs-adapter`: requires a thin adapter wired by the consumer.
 * - `consumer-locked`: contains business-specific logic that cannot be
 *   generalised.
 */
export type GeneralizationLevel =
  | "portable"
  | "needs-adapter"
  | "consumer-locked";

/**
 * Generalisation contract — what the forbidden-terms audit scans for, and
 * which props the consumer MUST inject.
 */
export interface SliceGeneralization {
  level: GeneralizationLevel;
  /**
   * Identifiers / business terms that MUST NOT appear in the slice source
   * tree. check-forbidden-terms.mjs scans .ts/.tsx files. Empty when the
   * slice is generic.
   */
  forbiddenTerms?: string[];
  /**
   * Props the consumer must inject for the slice to remain portable —
   * e.g. `["basePath", "labels", "permission"]`.
   */
  requiredProps?: string[];
}

// ---------------------------------------------------------------------------
// Top-level contract
// ---------------------------------------------------------------------------

/**
 * The full Phase-A slice contract shape.
 *
 * @see `defineSliceContract` (in ./contract) for the runtime-checked constructor.
 */
export interface SliceContract {
  /** Slice slug — kebab-case, matches the folder name. */
  id: string;
  /** Semver — `MAJOR.MINOR.PATCH`, optional `-prerelease` and `+build`. */
  version: string;
  /** Host requirements. */
  requires: SliceContractRequires;
  /** Surface exposed to the host. */
  provides: SliceContractProvides;
  /**
   * Known incompatibilities — `"<slug>:<provides-key>.<value>"`.
   *
   * Example: `"midtrans-payment:tables.paymentOrders"` declares that this
   * slice collides with `midtrans-payment` over the `paymentOrders` table.
   * The validator surfaces this as a P0 finding when both slices are
   * composed into the same app.
   */
  conflicts?: string[];
  /** Map of previous-version → migration script id. */
  migrationFrom?: Record<string, string>;
  /** Portability gate — feeds the forbidden-terms audit. */
  generalization?: SliceGeneralization;
}

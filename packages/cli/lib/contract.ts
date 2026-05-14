/**
 * Slice Composition Compiler — Phase A: Typed contract DSL.
 *
 * This module exposes the {@link defineSliceContract} factory plus the
 * supporting type vocabulary. A slice contract is the typed, code-shaped
 * sibling of the legacy `slice.manifest.json`. Both coexist during the
 * migration; new slices should ship a contract while keeping the JSON
 * manifest for back-compat with the npm CLI manifest pipeline.
 *
 * @module packages/cli/lib/contract
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
 * {@link defineSliceContract}. The runtime check rejects empty segments and
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
}

// ---------------------------------------------------------------------------
// Top-level contract
// ---------------------------------------------------------------------------

/**
 * The full Phase-A slice contract shape.
 *
 * @see {@link defineSliceContract} for the runtime-checked constructor.
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
}

// ---------------------------------------------------------------------------
// Runtime regexes
// ---------------------------------------------------------------------------

const KEBAB_CASE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
// Plain semver — also tolerates pre-release + build metadata.
const SEMVER =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const PREFIX = /^[a-z][a-z0-9_]*_$/;
const CONFLICT = /^[a-z][a-z0-9-]*:(routes|hooks|tables|events|components)\.[A-Za-z0-9_\-\/]+$/;
const PERMISSION = /^[^.]+\.[^.]+$/;

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Identity factory that runtime-validates a {@link SliceContract}.
 *
 * Throws a descriptive {@link Error} when the contract violates any of the
 * Phase-A invariants:
 *
 * - `id` must be kebab-case (`^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$`).
 * - `version` must be semver.
 * - When `requires.convex` is set, every `requires.convex.tables[i]` must
 *   start with `requires.convex.prefix`.
 * - When `requires.convex` is set and `provides.tables` is non-empty, every
 *   `provides.tables[i]` must start with `requires.convex.prefix`.
 * - Each `conflicts[i]` must match
 *   `<kebab-slug>:<routes|hooks|tables|events|components>.<value>`.
 * - Each `requires.rbac[i]` must be a `domain.action` pair (exactly one dot,
 *   non-empty halves).
 *
 * Returns the contract object unchanged so callers can write
 * `export const contract = defineSliceContract({ ... })`.
 *
 * @param c The contract to validate.
 * @returns The exact same object reference, narrowed to {@link SliceContract}.
 */
export function defineSliceContract(c: SliceContract): SliceContract {
  if (!c || typeof c !== "object") {
    throw new Error("defineSliceContract: expected an object, got " + typeof c);
  }
  if (typeof c.id !== "string" || !KEBAB_CASE.test(c.id)) {
    throw new Error(`defineSliceContract: id "${String(c.id)}" must be kebab-case`);
  }
  if (typeof c.version !== "string" || !SEMVER.test(c.version)) {
    throw new Error(`defineSliceContract(${c.id}): version "${String(c.version)}" is not semver`);
  }
  if (!c.requires || typeof c.requires !== "object") {
    throw new Error(`defineSliceContract(${c.id}): requires must be an object`);
  }
  if (!c.provides || typeof c.provides !== "object") {
    throw new Error(`defineSliceContract(${c.id}): provides must be an object`);
  }

  // RBAC
  if (c.requires.rbac) {
    if (!Array.isArray(c.requires.rbac)) {
      throw new Error(`defineSliceContract(${c.id}): requires.rbac must be an array`);
    }
    for (const p of c.requires.rbac) {
      if (typeof p !== "string" || !PERMISSION.test(p)) {
        throw new Error(
          `defineSliceContract(${c.id}): rbac entry "${String(p)}" must be "<domain>.<action>"`,
        );
      }
    }
  }

  // Convex prefix invariants
  const cx = c.requires.convex;
  if (cx) {
    if (typeof cx.prefix !== "string" || !PREFIX.test(cx.prefix)) {
      throw new Error(
        `defineSliceContract(${c.id}): convex.prefix "${String(cx.prefix)}" must match /^[a-z][a-z0-9_]*_$/`,
      );
    }
    if (!Array.isArray(cx.tables)) {
      throw new Error(`defineSliceContract(${c.id}): convex.tables must be an array`);
    }
    for (const t of cx.tables) {
      if (typeof t !== "string" || !t.startsWith(cx.prefix)) {
        throw new Error(
          `defineSliceContract(${c.id}): convex.tables entry "${String(t)}" must start with prefix "${cx.prefix}"`,
        );
      }
    }
    if (Array.isArray(c.provides.tables)) {
      for (const t of c.provides.tables) {
        if (typeof t !== "string" || !t.startsWith(cx.prefix)) {
          throw new Error(
            `defineSliceContract(${c.id}): provides.tables entry "${String(t)}" must start with prefix "${cx.prefix}"`,
          );
        }
      }
    }
  }

  // Conflicts
  if (c.conflicts) {
    if (!Array.isArray(c.conflicts)) {
      throw new Error(`defineSliceContract(${c.id}): conflicts must be an array`);
    }
    for (const cf of c.conflicts) {
      if (typeof cf !== "string" || !CONFLICT.test(cf)) {
        throw new Error(
          `defineSliceContract(${c.id}): conflicts entry "${String(cf)}" must match "<slug>:<routes|hooks|tables|events|components>.<value>"`,
        );
      }
    }
  }

  return c;
}

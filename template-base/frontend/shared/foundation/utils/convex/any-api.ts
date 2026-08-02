/**
 * TS2589 escape hatch for Convex's generated `api` type.
 *
 * Some modules with many `useQuery` / `useMutation` calls trip
 * `TS2589: Type instantiation is excessively deep and possibly infinite`
 * because Convex's generated types compose deep generic reference chains.
 * TypeScript's instantiation budget is fixed; past a threshold the
 * compiler bails out.
 *
 * Using `anyApi` sacrifices autocomplete + argument validation on the
 * query/mutation refs in the affected file. In exchange, the compiler
 * avoids walking the full generated-api type tree.
 *
 * Prefer the real `api` import. Only reach for this when tsc actually
 * reports TS2589 in that module. Revisit after upgrading past TS 5.6
 * or when Convex ships a lighter type surface.
 *
 * @example
 * ```ts
 * // import { api } from "@/convex/_generated/api"
 * import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
 *
 * const data = useQuery(api.features.overview.queries.getData, { workspaceId })
 * ```
 */

import { anyApi } from "convex/server"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const api = anyApi as any

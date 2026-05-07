/**
 * Reports Feature API
 *
 * Dynamic import pattern untuk menghindari circular dependencies
 * dan mempermudah maintenance.
 *
 * Usage:
 * ```typescript
 * import { useQuery } from "convex/react"
 * import { reportsApi } from "../api"
 *
 * const reports = useQuery(reportsApi.queries.list, { workspaceId })
 * ```
 */

import { api } from "@/convex/_generated/api"

export const reportsApi = {
  queries: {
    list: api.features.reports.queries.list,
    get: api.features.reports.queries.get,
  },
  mutations: {
    create: api.features.reports.mutations.create,
    update: api.features.reports.mutations.update,
    remove: api.features.reports.mutations.remove,
  },
} as const

// Type-safe exports
export type ReportsApi = typeof reportsApi

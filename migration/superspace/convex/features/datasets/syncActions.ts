"use node"

import { v } from "convex/values"
import { action } from "../../_generated/server"
import { anyApi } from "convex/server"
import { ConvexHttpClient } from "convex/browser"
import { logAuditEvent } from "../../shared/audit"
import type { Id } from "../../_generated/dataModel"

const PROBE_TIMEOUT_MS = 30_000
const COOLDOWN_MS = 30_000

interface SyncResult {
  ok: boolean
  inserted: number
  updated: number
  skipped: number
  errors: number
  error?: string
}

/**
 * Pull dataset records from a remote Convex deployment (same datasets
 * framework) into a local dataset.
 *
 * Authentication:
 *   - workspaceDataSources.adminKey is the remote's admin key
 *   - source.endpointUrl is the remote Convex HTTP URL (https://x.convex.cloud)
 *   - Caller supplies remote dataset id OR slug to pull from
 *
 * Direction: remote → local. For "push remote ← local", use the ingress
 * key flow on the remote side.
 */
export const syncFromRemoteDataset = action({
  args: {
    sourceId: v.id("workspaceDataSources"),
    localDatasetId: v.id("datasets"),
    remoteDatasetId: v.string(),
    fromDate: v.optional(v.string()),
    toDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<SyncResult> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiAny: any = anyApi

    const source = await ctx.runQuery(apiAny.features.dataSources.internal.getDataSourceWithKey, {
      id: args.sourceId,
    }) as {
      _id: Id<"workspaceDataSources">
      workspaceId: Id<"workspaces">
      endpointUrl: string
      adminKey: string
      lastTestedAt: number | null
    } | null
    if (!source) throw new Error("Data source not found")

    const dataset = await ctx.runQuery(apiAny.features.datasets.queries.getDataset, {
      id: args.localDatasetId,
    }) as { workspaceId: Id<"workspaces"> } | null
    if (!dataset) throw new Error("Local dataset not found")
    if (dataset.workspaceId !== source.workspaceId) {
      throw new Error("Source and dataset belong to different workspaces")
    }

    // Build a remote Convex client. setAdminAuth exists at runtime but
    // is omitted from the public d.ts in this version — cast through any.
    const remote = new ConvexHttpClient(source.endpointUrl)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(remote as any).setAdminAuth(source.adminKey)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)

    let remoteRows: Array<{
      _id: string
      externalId?: string
      fields: Record<string, unknown>
    }> = []

    try {
      remoteRows = await remote.query(apiAny.features.datasets.queries.listDatasetRecords, {
        datasetId: args.remoteDatasetId,
        fromDate: args.fromDate,
        toDate: args.toDate,
        limit: Math.min(args.limit ?? 500, 500),
      })
    } catch (err) {
      clearTimeout(timer)
      const message = err instanceof Error ? err.message : "Remote query failed"
      await ctx.runMutation(apiAny.features.dataSources.mutations.setDataSourceStatus, {
        id: source._id,
        status: "error",
        lastError: `Sync failed: ${message}`,
        lastTestedAt: Date.now(),
      })
      return { ok: false, inserted: 0, updated: 0, skipped: 0, errors: 1, error: message }
    } finally {
      clearTimeout(timer)
    }

    if (!Array.isArray(remoteRows) || remoteRows.length === 0) {
      await ctx.runMutation(apiAny.features.dataSources.mutations.setDataSourceStatus, {
        id: source._id,
        status: "connected",
        lastTestedAt: Date.now(),
      })
      return { ok: true, inserted: 0, updated: 0, skipped: 0, errors: 0 }
    }

    // Map remote rows → bulk upsert payload. Use remote externalId (or
    // remote _id as fallback) so re-running the sync is idempotent.
    const payload = remoteRows.map((r) => ({
      externalId: r.externalId ?? `remote:${r._id}`,
      fields: r.fields,
    }))

    const result = await ctx.runMutation(apiAny.features.datasets.mutations.bulkUpsertRecords, {
      workspaceId: source.workspaceId,
      datasetId: args.localDatasetId,
      records: payload,
      source: "sync",
    }) as { inserted: number; updated: number; skipped: number; errors: { message: string }[] }

    await ctx.runMutation(apiAny.features.dataSources.mutations.setDataSourceStatus, {
      id: source._id,
      status: "connected",
      lastTestedAt: Date.now(),
    })

    return {
      ok: true,
      inserted: result.inserted,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors.length,
    }
  },
})

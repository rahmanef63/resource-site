"use node"

import { v } from "convex/values"
import { action } from "../../_generated/server"
import { anyApi } from "convex/server"
import type { Id } from "../../_generated/dataModel"

/**
 * Probe a stored Convex source by hitting the remote `/version` (or
 * equivalent) endpoint with the admin key. Updates the source's
 * status + lastTestedAt + lastError via setDataSourceStatus.
 *
 * Runs in the Node runtime so we can use global fetch with the admin
 * key as a Bearer token — kept server-side; the key never reaches the
 * browser.
 *
 * Rate-limited to one probe per source per 10s to prevent abuse.
 */
const PROBE_TIMEOUT_MS = 8_000
const COOLDOWN_MS = 10_000

export const testDataSource = action({
  args: {
    id: v.id("workspaceDataSources"),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; status: string; error?: string }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiAny: any = anyApi
    const source = await ctx.runQuery(apiAny.features.dataSources.internal.getDataSourceWithKey, {
      id: args.id,
    }) as {
      _id: Id<"workspaceDataSources">
      workspaceId: Id<"workspaces">
      endpointUrl: string
      adminKey: string
      lastTestedAt: number | null
    } | null

    if (!source) throw new Error("Data source not found")

    if (source.lastTestedAt && Date.now() - source.lastTestedAt < COOLDOWN_MS) {
      throw new Error("Rate limited — try again in a few seconds")
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)

    let status: "connected" | "error" = "error"
    let errorMessage: string | undefined

    try {
      const probeUrl = `${source.endpointUrl.replace(/\/$/, "")}/version`
      const res = await fetch(probeUrl, {
        method: "GET",
        headers: { Authorization: `Convex ${source.adminKey}` },
        signal: controller.signal,
      })
      if (res.ok) {
        status = "connected"
      } else {
        errorMessage = `Probe returned HTTP ${res.status}`
      }
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "Unknown probe error"
    } finally {
      clearTimeout(timeout)
    }

    await ctx.runMutation(apiAny.features.dataSources.mutations.setDataSourceStatus, {
      id: source._id,
      status,
      lastError: errorMessage,
      lastTestedAt: Date.now(),
    })

    return {
      ok: status === "connected",
      status,
      error: errorMessage,
    }
  },
})

"use node"

import { v } from "convex/values"
import { action } from "../../_generated/server"
import { anyApi } from "convex/server"
import { randomBytes, createHash } from "node:crypto"
import type { Id } from "../../_generated/dataModel"

const KEY_BYTES = 32 // 256-bit entropy
const PREFIX_LENGTH = 8

function generateRawKey(): { raw: string; prefix: string; hash: string } {
  // Base32-ish from random bytes; URL-safe.
  const raw = "ssk_" + randomBytes(KEY_BYTES).toString("hex")
  const prefix = raw.slice(0, PREFIX_LENGTH)
  const hash = createHash("sha256").update(raw).digest("hex")
  return { raw, prefix, hash }
}

export function hashIngressKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex")
}

/**
 * Create an ingress key. Returns the raw key ONCE — caller must store it
 * somewhere safe; superspace stores only the SHA-256 hash and queries
 * the table by prefix for fast lookup.
 *
 * Owner-only (workspace.manage). Audit logged.
 */
export const createIngressKey = action({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    scopeAllDatasets: v.boolean(),
    scopeDatasetIds: v.array(v.id("datasets")),
  },
  handler: async (ctx, args): Promise<{ id: Id<"workspaceIngressKeys">; rawKey: string }> => {
    const { raw, prefix, hash } = generateRawKey()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiAny: any = anyApi
    const id: Id<"workspaceIngressKeys"> = await ctx.runMutation(
      apiAny.features.datasets.ingressMutations.persistIngressKey,
      {
        workspaceId: args.workspaceId,
        name: args.name,
        keyPrefix: prefix,
        keyHash: hash,
        scopeAllDatasets: args.scopeAllDatasets,
        scopeDatasetIds: args.scopeDatasetIds,
      },
    )
    return { id, rawKey: raw }
  },
})

"use node"

import { v } from "convex/values"
import { action } from "../../_generated/server"
import { anyApi } from "convex/server"
import { createHmac, randomBytes } from "node:crypto"
import type { Id } from "../../_generated/dataModel"

const DISPATCH_TIMEOUT_MS = 8_000

function hmacSign(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex")
}

/**
 * Generate a 256-bit URL-safe webhook secret. Returned to the UI once at
 * creation; SuperSpace stores it in plain form so it can sign outgoing
 * payloads. The receiver uses the same secret to verify HMAC.
 */
export const generateWebhookSecret = action({
  args: {},
  handler: async (): Promise<{ secret: string }> => {
    return { secret: "whk_" + randomBytes(24).toString("base64url") }
  },
})

/**
 * Dispatch a single webhook delivery. Triggered by UI "Test" button or
 * by future schedulers when record events fire.
 *
 * Body shape:
 *   {
 *     event: "dataset.record.created" | ...,
 *     workspaceId,
 *     datasetId,
 *     timestamp,
 *     payload: <event-specific>
 *   }
 *
 * Headers:
 *   X-SuperSpace-Event: <event>
 *   X-SuperSpace-Signature: hmac-sha256-hex of body using webhook.secret
 *   X-SuperSpace-Workspace: <workspaceId>
 */
export const dispatchWebhook = action({
  args: {
    id: v.id("workspaceOutgoingWebhooks"),
    event: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args): Promise<{ ok: boolean; httpStatus?: number; error?: string }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiAny: any = anyApi
    const wh = await ctx.runMutation(apiAny.features.datasets.webhooks.getWebhookWithSecret, {
      id: args.id,
    }) as {
      _id: Id<"workspaceOutgoingWebhooks">
      workspaceId: Id<"workspaces">
      url: string
      secret: string
      active: boolean
      events: string[]
    } | null

    if (!wh) throw new Error("Webhook not found")
    if (!wh.active) throw new Error("Webhook is disabled")
    if (!wh.events.includes(args.event)) {
      throw new Error(`Webhook does not subscribe to ${args.event}`)
    }

    const body = JSON.stringify({
      event: args.event,
      workspaceId: wh.workspaceId,
      timestamp: Date.now(),
      payload: args.payload,
    })
    const signature = hmacSign(wh.secret, body)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), DISPATCH_TIMEOUT_MS)
    const started = Date.now()
    let httpStatus: number | undefined
    let httpError: string | undefined
    try {
      const res = await fetch(wh.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SuperSpace-Event": args.event,
          "X-SuperSpace-Signature": signature,
          "X-SuperSpace-Workspace": String(wh.workspaceId),
        },
        body,
        signal: controller.signal,
      })
      httpStatus = res.status
      if (!res.ok) {
        const text = (await res.text()).slice(0, 500)
        httpError = `HTTP ${res.status}: ${text}`
      }
    } catch (err) {
      httpError = err instanceof Error ? err.message : "fetch failed"
    } finally {
      clearTimeout(timer)
    }
    const durationMs = Date.now() - started

    await ctx.runMutation(apiAny.features.datasets.webhooks.recordDelivery, {
      webhookId: wh._id,
      workspaceId: wh.workspaceId,
      event: args.event,
      payload: body,
      httpStatus,
      httpError,
      durationMs,
    })

    return {
      ok: !!httpStatus && httpStatus >= 200 && httpStatus < 300,
      httpStatus,
      error: httpError,
    }
  },
})

/**
 * Test webhook with a synthetic ping payload.
 */
export const testWebhook = action({
  args: { id: v.id("workspaceOutgoingWebhooks") },
  handler: async (ctx, args): Promise<{ ok: boolean; httpStatus?: number; error?: string }> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiAny: any = anyApi
    return ctx.runAction(apiAny.features.datasets.webhookActions.dispatchWebhook, {
      id: args.id,
      event: "dataset.record.created",
      payload: {
        ping: true,
        message: "This is a SuperSpace webhook test. If you can read this, signing works.",
      },
    })
  },
})

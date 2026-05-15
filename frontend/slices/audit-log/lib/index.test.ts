import { describe, it, expect, vi } from "vitest"
import { createAuditLogger, NULL_TENANT_ADAPTER } from "./index"
import type { TenantAdapter, AuditLogBindings } from "../types"

describe("createAuditLogger", () => {
  const tenantAdapter: TenantAdapter = {
    resolveTenantId: () => "ws_123",
    resolveActorId: () => "usr_abc",
  }

  it("invokes the bound mutation with tenant + actor injected", async () => {
    const logEventMutation = vi.fn<(ctx: unknown, event: any) => Promise<string>>(async () => "evt_1")
    const bindings: AuditLogBindings = { logEventMutation, listEventsQuery: undefined }
    const log = createAuditLogger(tenantAdapter, bindings)

    await log({}, { action: "x.create", entityType: "x", entityId: "x1" })

    expect(logEventMutation).toHaveBeenCalledTimes(1)
    const [, event] = logEventMutation.mock.calls[0]
    expect(event.tenantId).toBe("ws_123")
    expect(event.actorId).toBe("usr_abc")
    expect(event.action).toBe("x.create")
    expect(typeof event.at).toBe("number")
  })

  it("passes optional diff + metadata + ip + ua through verbatim", async () => {
    const logEventMutation = vi.fn<(ctx: unknown, event: any) => Promise<void>>(async () => undefined)
    const log = createAuditLogger(tenantAdapter, { logEventMutation, listEventsQuery: undefined })

    await log(null, {
      action: "y.update",
      entityType: "y",
      entityId: "y1",
      diff: { name: { before: "old", after: "new" } },
      metadata: { source: "ui" },
      ipAddress: "10.0.0.1",
      userAgent: "test",
    })

    const [, event] = logEventMutation.mock.calls[0]
    expect(event.diff).toEqual({ name: { before: "old", after: "new" } })
    expect(event.metadata).toEqual({ source: "ui" })
    expect(event.ipAddress).toBe("10.0.0.1")
    expect(event.userAgent).toBe("test")
  })

  it("respects caller-supplied `at` timestamp when present", async () => {
    const logEventMutation = vi.fn<(ctx: unknown, event: any) => Promise<void>>(async () => undefined)
    const log = createAuditLogger(tenantAdapter, { logEventMutation, listEventsQuery: undefined })
    await log({}, { action: "z.x", entityType: "z", entityId: "z1", at: 12345 })
    const [, event] = logEventMutation.mock.calls[0]
    expect(event.at).toBe(12345)
  })

  it("is a no-op when no logEventMutation is wired (offline-safe)", async () => {
    const log = createAuditLogger(tenantAdapter, {
      logEventMutation: undefined,
      listEventsQuery: undefined,
    })
    await expect(
      log({}, { action: "n.x", entityType: "n", entityId: "n1" })
    ).resolves.toBeUndefined()
  })
})

describe("NULL_TENANT_ADAPTER", () => {
  it("resolves tenant to null (single-tenant consumers)", () => {
    expect(NULL_TENANT_ADAPTER.resolveTenantId({})).toBeNull()
  })

  it("resolves actor to anonymous sentinel", () => {
    expect(NULL_TENANT_ADAPTER.resolveActorId({})).toBe("anonymous")
  })

  it("composes with createAuditLogger producing tenantId=null events", async () => {
    const logEventMutation = vi.fn<(ctx: unknown, event: any) => Promise<void>>(async () => undefined)
    const log = createAuditLogger(NULL_TENANT_ADAPTER, {
      logEventMutation,
      listEventsQuery: undefined,
    })
    await log({}, { action: "single.event", entityType: "x", entityId: "x1" })
    const [, event] = logEventMutation.mock.calls[0]
    expect(event.tenantId).toBeNull()
    expect(event.actorId).toBe("anonymous")
  })
})

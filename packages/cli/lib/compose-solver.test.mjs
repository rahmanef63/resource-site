// Vitest suite for the Phase B compose solver.
// Uses synthetic in-memory contracts so the tests are independent of the
// real frontend/slices/*/slice.contract.ts files. The loader is exercised
// indirectly by the CLI smoke test in the worktree-verify step.

import { describe, expect, it } from "vitest";
import { compose } from "./compose-solver.mjs";

/**
 * Tiny helper — build a Map of slug → contract from an array of inline
 * contract objects so each test reads as a single scenario block.
 */
function makeContracts(arr) {
  return new Map(arr.map((c) => [c.id, c]));
}

describe("compose() — empty + happy paths", () => {
  it("empty desired → empty accepted/rejected/conflicts", () => {
    const result = compose(
      { state: {}, desired: [] },
      makeContracts([]),
    );
    expect(result.accepted).toEqual([]);
    expect(result.rejected).toEqual([]);
    expect(result.conflicts).toEqual([]);
    expect(result.envMissing).toEqual([]);
    expect(result.rbacToCreate).toEqual([]);
    expect(result.tablesAdded).toEqual([]);
    expect(result.proof).toEqual([]);
  });

  it("single slice, no conflicts → accepted", () => {
    const result = compose(
      { state: { auth: "convex" }, desired: ["mdx-blog"] },
      makeContracts([
        {
          id: "mdx-blog",
          version: "0.1.0",
          requires: {},
          provides: { routes: ["/blog"] },
        },
      ]),
    );
    expect(result.accepted).toEqual(["mdx-blog"]);
    expect(result.rejected).toEqual([]);
    expect(result.conflicts.filter((c) => c.severity === "blocker")).toEqual([]);
    expect(result.proof.some((l) => l.startsWith("+ mdx-blog"))).toBe(true);
  });
});

describe("compose() — auth-mismatch", () => {
  it("slice wants convex but target has clerk → blocker", () => {
    const result = compose(
      { state: { auth: "clerk" }, desired: ["convex-auth"] },
      makeContracts([
        {
          id: "convex-auth",
          version: "0.1.0",
          requires: { auth: "convex" },
          provides: {},
        },
      ]),
    );
    expect(result.accepted).toEqual([]);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].slug).toBe("convex-auth");
    const blockers = result.rejected[0].reasons.filter((r) => r.severity === "blocker");
    expect(blockers.map((b) => b.type)).toContain("auth-mismatch");
  });
});

describe("compose() — explicit-conflict", () => {
  it("doku + midtrans collide on paymentOrders → both rejected", () => {
    const contracts = makeContracts([
      {
        id: "doku-payment",
        version: "0.1.0",
        requires: {
          auth: "convex",
          convex: { prefix: "doku_", tables: ["doku_orders"] },
        },
        provides: { tables: ["doku_orders"] },
        conflicts: ["midtrans-payment:tables.paymentOrders"],
      },
      {
        id: "midtrans-payment",
        version: "0.1.0",
        requires: {
          auth: "convex",
          convex: { prefix: "midtrans_", tables: ["paymentOrders"] },
        },
        provides: { tables: ["paymentOrders"] },
      },
    ]);
    const result = compose(
      { state: { auth: "convex" }, desired: ["doku-payment", "midtrans-payment"] },
      contracts,
    );
    expect(result.accepted).toEqual([]);
    const rejectedSlugs = result.rejected.map((r) => r.slug).sort();
    expect(rejectedSlugs).toEqual(["doku-payment", "midtrans-payment"]);
    const explicit = result.conflicts.filter((c) => c.type === "explicit-conflict");
    expect(explicit.length).toBeGreaterThanOrEqual(2); // mirrored attribution
  });
});

describe("compose() — missing dep", () => {
  it("desired contract not found → blocker missing-dep", () => {
    const result = compose(
      { state: {}, desired: ["nonexistent"] },
      makeContracts([]),
    );
    expect(result.accepted).toEqual([]);
    expect(result.rejected.map((r) => r.slug)).toEqual(["nonexistent"]);
    expect(result.conflicts[0]?.type).toBe("missing-dep");
  });

  it("slice deps on unknown slice → blocker missing-dep on parent", () => {
    const contracts = makeContracts([
      {
        id: "child",
        version: "0.1.0",
        requires: { deps: ["ghost"] },
        provides: {},
      },
    ]);
    const result = compose({ state: {}, desired: ["child"] }, contracts);
    expect(result.accepted).toEqual([]);
    const blockers = result.conflicts.filter(
      (c) => c.type === "missing-dep" && c.withSlug === "ghost",
    );
    expect(blockers.length).toBe(1);
  });
});

describe("compose() — transitive dep resolution", () => {
  it("desired pulls in dep automatically", () => {
    const contracts = makeContracts([
      {
        id: "doku",
        version: "0.1.0",
        requires: { auth: "convex", deps: ["convex-auth"] },
        provides: {},
      },
      {
        id: "convex-auth",
        version: "0.1.0",
        requires: { auth: "convex" },
        provides: {},
      },
    ]);
    const result = compose(
      { state: { auth: "convex" }, desired: ["doku"] },
      contracts,
    );
    expect(result.accepted.sort()).toEqual(["convex-auth", "doku"]);
    expect(result.proof.some((l) => l.includes("transitive dep"))).toBe(true);
  });
});

describe("compose() — installed wins", () => {
  it("a slice already installed isn't rejected even if it conflicts with a new one", () => {
    const contracts = makeContracts([
      {
        id: "doku-payment",
        version: "0.1.0",
        requires: { auth: "convex" },
        provides: { tables: ["doku_orders"] },
        conflicts: ["midtrans-payment:tables.paymentOrders"],
      },
      {
        id: "midtrans-payment",
        version: "0.1.0",
        requires: { auth: "convex" },
        provides: { tables: ["paymentOrders"] },
      },
    ]);
    const result = compose(
      {
        state: { auth: "convex", slicesInstalled: ["doku-payment"] },
        desired: ["doku-payment", "midtrans-payment"],
      },
      contracts,
    );
    // doku is installed — wins; midtrans gets rejected.
    expect(result.accepted).toContain("doku-payment");
    expect(result.rejected.map((r) => r.slug)).toContain("midtrans-payment");
  });
});

describe("compose() — cycle detection", () => {
  it("throws when deps form a cycle", () => {
    const contracts = makeContracts([
      { id: "a", version: "0.1.0", requires: { deps: ["b"] }, provides: {} },
      { id: "b", version: "0.1.0", requires: { deps: ["a"] }, provides: {} },
    ]);
    expect(() =>
      compose({ state: {}, desired: ["a"] }, contracts),
    ).toThrowError(/cycle/);
  });
});

describe("compose() — env warning is non-blocking", () => {
  it("missing env surfaces as warning but slice is accepted", () => {
    const contracts = makeContracts([
      {
        id: "doku",
        version: "0.1.0",
        requires: { auth: "convex", env: ["DOKU_CLIENT_ID"] },
        provides: {},
      },
    ]);
    const result = compose(
      { state: { auth: "convex", envExisting: [] }, desired: ["doku"] },
      contracts,
    );
    expect(result.accepted).toEqual(["doku"]);
    expect(result.envMissing).toContain("DOKU_CLIENT_ID");
    const warnings = result.conflicts.filter((c) => c.severity === "warning");
    expect(warnings.some((w) => w.type === "env-missing")).toBe(true);
  });
});

describe("compose() — table collision with target state", () => {
  it("blocks when slice declares a table already in convexTablesExisting", () => {
    const contracts = makeContracts([
      {
        id: "doku",
        version: "0.1.0",
        requires: { auth: "convex" },
        provides: { tables: ["doku_orders"] },
      },
    ]);
    const result = compose(
      {
        state: { auth: "convex", convexTablesExisting: ["doku_orders"] },
        desired: ["doku"],
      },
      contracts,
    );
    expect(result.accepted).toEqual([]);
    expect(result.rejected[0].reasons.map((r) => r.type)).toContain(
      "table-collision",
    );
  });
});

describe("compose() — rbacToCreate aggregation", () => {
  it("collects rbac perms not already in target", () => {
    const contracts = makeContracts([
      {
        id: "convex-auth",
        version: "0.1.0",
        requires: {
          auth: "convex",
          rbac: ["auth.sign-in", "auth.sign-out"],
        },
        provides: {},
      },
    ]);
    const result = compose(
      {
        state: { auth: "convex", rbacRolesExisting: ["auth.sign-in"] },
        desired: ["convex-auth"],
      },
      contracts,
    );
    expect(result.accepted).toEqual(["convex-auth"]);
    expect(result.rbacToCreate).toEqual(["auth.sign-out"]);
  });
});

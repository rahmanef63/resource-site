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

describe("compose() — explicit-conflict (v2 arbitration)", () => {
  it("doku + midtrans collide on paymentOrders → arbitration drops loser only", () => {
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
    // Equal dependers (0 each) → alphabetical tiebreak drops "midtrans-payment".
    expect(result.accepted).toEqual(["doku-payment"]);
    expect(result.rejected.map((r) => r.slug)).toEqual(["midtrans-payment"]);
    const explicit = result.conflicts.filter((c) => c.type === "explicit-conflict");
    expect(explicit.length).toBeGreaterThanOrEqual(1);
    expect(result.arbitrations).toBeDefined();
    expect(result.arbitrations[0].winner).toBe("doku-payment");
    expect(result.arbitrations[0].loser).toBe("midtrans-payment");
  });
});

describe("compose() — missing dep", () => {
  it("desired contract not found (strict) → blocker missing-dep", () => {
    const result = compose(
      { state: { allowUnknownSlices: false }, desired: ["nonexistent"] },
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

// ─── v2 — arbitration by dependers ──────────────────────────────────────────

describe("compose() — arbitration: most-dependers wins", () => {
  it("two slices conflict, A has more dependers than B → A accepted, B rejected", () => {
    // a is pulled in as transitive dep by `client1` and `client2`; b has zero
    // dependers. They conflict on a shared table → a wins.
    const contracts = makeContracts([
      {
        id: "a",
        version: "0.1.0",
        requires: { auth: "convex" },
        provides: { tables: ["shared_table"] },
      },
      {
        id: "b",
        version: "0.1.0",
        requires: { auth: "convex" },
        provides: { tables: ["shared_table"] },
      },
      {
        id: "client1",
        version: "0.1.0",
        requires: { auth: "convex", deps: ["a"] },
        provides: {},
      },
      {
        id: "client2",
        version: "0.1.0",
        requires: { auth: "convex", deps: ["a"] },
        provides: {},
      },
    ]);
    const result = compose(
      { state: { auth: "convex" }, desired: ["a", "b", "client1", "client2"] },
      contracts,
    );
    expect(result.accepted).toContain("a");
    expect(result.accepted).toContain("client1");
    expect(result.accepted).toContain("client2");
    expect(result.rejected.map((r) => r.slug)).toEqual(["b"]);
    expect(result.arbitrations).toBeDefined();
    expect(result.arbitrations[0].winner).toBe("a");
    expect(result.arbitrations[0].loser).toBe("b");
    expect(result.arbitrations[0].reason).toMatch(/dependers/);
  });
});

describe("compose() — arbitration: alphabetical tiebreak", () => {
  it("equal dependers → drop lex-later slug", () => {
    const contracts = makeContracts([
      {
        id: "alpha",
        version: "0.1.0",
        requires: { auth: "convex" },
        provides: { tables: ["t"] },
      },
      {
        id: "zeta",
        version: "0.1.0",
        requires: { auth: "convex" },
        provides: { tables: ["t"] },
      },
    ]);
    const result = compose(
      { state: { auth: "convex" }, desired: ["alpha", "zeta"] },
      contracts,
    );
    expect(result.accepted).toEqual(["alpha"]);
    expect(result.rejected.map((r) => r.slug)).toEqual(["zeta"]);
    expect(result.arbitrations[0].reason).toMatch(/alphabetical/);
  });
});

describe("compose() — arbitration: both installed", () => {
  it("both slices already installed and in conflict → kept with warning, no arbitration drop", () => {
    const contracts = makeContracts([
      {
        id: "a",
        version: "0.1.0",
        requires: { auth: "convex" },
        provides: { tables: ["t"] },
      },
      {
        id: "b",
        version: "0.1.0",
        requires: { auth: "convex" },
        provides: { tables: ["t"] },
      },
    ]);
    const result = compose(
      {
        state: { auth: "convex", slicesInstalled: ["a", "b"] },
        desired: ["a", "b"],
      },
      contracts,
    );
    expect(result.accepted.sort()).toEqual(["a", "b"]);
    expect(result.rejected).toEqual([]);
    expect(result.arbitrations).toBeUndefined();
    const both = result.conflicts.filter((c) => c.type === "both-installed-conflict");
    expect(both.length).toBeGreaterThan(0);
    expect(both[0].severity).toBe("warning");
    expect(result.notes?.a).toBe("both-installed-conflict");
    expect(result.notes?.b).toBe("both-installed-conflict");
  });
});

// ─── v2 — uncontracted slices ───────────────────────────────────────────────

describe("compose() — uncontracted slice (default allowUnknownSlices=true)", () => {
  it("desired slug with no contract → accepted with uncontracted warning", () => {
    const result = compose(
      { state: {}, desired: ["nonexistent-slice"] },
      makeContracts([]),
    );
    expect(result.accepted).toEqual(["nonexistent-slice"]);
    expect(result.rejected).toEqual([]);
    const warn = result.conflicts.find((c) => c.type === "uncontracted");
    expect(warn).toBeDefined();
    expect(warn.severity).toBe("warning");
    expect(result.notes?.["nonexistent-slice"]).toBe("uncontracted");
  });

  it("strict mode (allowUnknownSlices: false) flips uncontracted to blocker missing-dep", () => {
    const result = compose(
      { state: { allowUnknownSlices: false }, desired: ["nonexistent-slice"] },
      makeContracts([]),
    );
    expect(result.accepted).toEqual([]);
    expect(result.rejected.map((r) => r.slug)).toEqual(["nonexistent-slice"]);
    const blocker = result.conflicts.find((c) => c.type === "missing-dep");
    expect(blocker?.severity).toBe("blocker");
  });
});

// ─── v2 — cycle path printing ───────────────────────────────────────────────

describe("compose() — cycle detection prints full path", () => {
  it("a → b → c → a throws with full cycle in message", () => {
    const contracts = makeContracts([
      { id: "a", version: "0.1.0", requires: { deps: ["b"] }, provides: {} },
      { id: "b", version: "0.1.0", requires: { deps: ["c"] }, provides: {} },
      { id: "c", version: "0.1.0", requires: { deps: ["a"] }, provides: {} },
    ]);
    expect(() => compose({ state: {}, desired: ["a"] }, contracts)).toThrowError(
      /dependency cycle detected: a → b → c → a/,
    );
  });
});

// ─── v2 — strict mode escalates warnings ────────────────────────────────────

describe("compose() — strict mode flips env-missing warning to blocker", () => {
  // The solver itself doesn't auto-elevate severity (that's a CLI concern),
  // but strict-mode state propagation must still surface env-missing so the
  // CLI wrapper can re-classify. The CLI test (hand-test) covers elevation.
  it("strict mode still surfaces env-missing — CLI elevates to blocker", () => {
    const contracts = makeContracts([
      {
        id: "doku",
        version: "0.1.0",
        requires: { auth: "convex", env: ["DOKU_CLIENT_ID"] },
        provides: {},
      },
    ]);
    const result = compose(
      {
        state: { auth: "convex", envExisting: [], allowUnknownSlices: false },
        desired: ["doku"],
      },
      contracts,
    );
    // The slice itself has a registered contract — strict doesn't block it.
    expect(result.accepted).toEqual(["doku"]);
    // env-missing is still a warning at the solver layer; CLI will elevate it
    // when --strict is set.
    const envWarn = result.conflicts.find((c) => c.type === "env-missing");
    expect(envWarn).toBeDefined();
    expect(envWarn.severity).toBe("warning");
  });
});

// ─── v2 — pair-collision arbitration on plain table-collision ───────────────

describe("compose() — table-collision arbitration vs reject-both", () => {
  it("two new candidates with shared table → loser dropped, winner kept", () => {
    const contracts = makeContracts([
      {
        id: "a",
        version: "0.1.0",
        requires: { auth: "convex" },
        provides: { tables: ["shared"] },
      },
      {
        id: "b",
        version: "0.1.0",
        requires: { auth: "convex" },
        provides: { tables: ["shared"] },
      },
    ]);
    const result = compose(
      { state: { auth: "convex" }, desired: ["a", "b"] },
      contracts,
    );
    expect(result.accepted).toEqual(["a"]);
    expect(result.rejected.map((r) => r.slug)).toEqual(["b"]);
  });
});

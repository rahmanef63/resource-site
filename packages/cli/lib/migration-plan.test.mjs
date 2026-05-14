// migration-plan.test.mjs — vitest coverage for the Phase E migration planner.

import { describe, it, expect } from "vitest";

import { diffContracts, planMigration } from "./migration-plan.mjs";

/** Tiny factory so each test only declares the bits it cares about. */
function makeContract(over = {}) {
  return {
    id: "demo",
    version: "0.1.0",
    requires: { auth: "convex", env: [], rbac: [] },
    provides: { tables: [], routes: [] },
    ...over,
    requires: { auth: "convex", env: [], rbac: [], ...(over.requires ?? {}) },
    provides: { tables: [], routes: [], ...(over.provides ?? {}) },
  };
}

describe("diffContracts", () => {
  it("identical contracts produce an empty diff", () => {
    const c = makeContract({ provides: { tables: ["demo_a"] } });
    const d = diffContracts(c, c);
    expect(d.added).toEqual({});
    expect(d.removed).toEqual({});
    expect(d.renamed).toEqual({});
  });

  it("detects added tables", () => {
    const from = makeContract({ provides: { tables: ["demo_a"] } });
    const to = makeContract({
      version: "0.2.0",
      provides: { tables: ["demo_a", "demo_b"] },
    });
    const d = diffContracts(from, to);
    expect(d.added.tables).toEqual(["demo_b"]);
    expect(d.removed).toEqual({});
  });

  it("rename detection requires the migrationFrom marker", () => {
    const from = makeContract({ provides: { tables: ["old_x"] } });
    const to = makeContract({
      version: "0.2.0",
      provides: { tables: ["new_x"] },
      // No migrationFrom — must NOT pair up.
    });
    const d = diffContracts(from, to);
    expect(d.renamed.tables).toBeUndefined();
    expect(d.added.tables).toEqual(["new_x"]);
    expect(d.removed.tables).toEqual(["old_x"]);
  });

  it("pairs renames when migrationFrom is set", () => {
    const from = makeContract({ provides: { tables: ["old_x"] } });
    const to = makeContract({
      version: "0.2.0",
      provides: { tables: ["new_x"] },
      migrationFrom: { "0.1.0": "rename-2026-05" },
    });
    const d = diffContracts(from, to);
    expect(d.renamed.tables).toEqual([{ from: "old_x", to: "new_x" }]);
    expect(d.added).toEqual({});
    expect(d.removed).toEqual({});
  });
});

describe("planMigration", () => {
  it("no-diff (same contract) → empty plan", () => {
    const c = makeContract({ provides: { tables: ["demo_a"] } });
    const plan = planMigration(diffContracts(c, c));
    expect(plan.steps).toEqual([]);
    expect(plan.summary.totalSteps).toBe(0);
    expect(plan.summary.highRisk).toBe(0);
    expect(plan.summary.irreversible).toBe(0);
    expect(plan.warnings).toEqual([]);
  });

  it("add 1 table → 1 low-risk reversible step", () => {
    const from = makeContract({ provides: { tables: ["demo_a"] } });
    const to = makeContract({
      version: "0.2.0",
      provides: { tables: ["demo_a", "demo_b"] },
    });
    const plan = planMigration(diffContracts(from, to));
    expect(plan.steps).toHaveLength(1);
    const step = plan.steps[0];
    expect(step.kind).toBe("convex-schema-add-table");
    expect(step.risk).toBe("low");
    expect(step.reversible).toBe(true);
    expect(step.artifacts.convexSchema).toContain("demo_b");
    expect(plan.summary.highRisk).toBe(0);
  });

  it("drop 1 table → 1 high-risk irreversible step + warning", () => {
    const from = makeContract({ provides: { tables: ["demo_a"] } });
    const to = makeContract({
      version: "0.2.0",
      provides: { tables: [] },
    });
    const plan = planMigration(diffContracts(from, to));
    expect(plan.steps).toHaveLength(1);
    const step = plan.steps[0];
    expect(step.kind).toBe("convex-schema-drop-table");
    expect(step.risk).toBe("high");
    expect(step.reversible).toBe(false);
    expect(step.artifacts.convexMigration).toContain("demo_a");
    expect(plan.warnings.length).toBe(1);
    expect(plan.warnings[0]).toMatch(/irreversible/i);
    expect(plan.summary.highRisk).toBe(1);
    expect(plan.summary.irreversible).toBe(1);
  });

  it("rename detected → 1 rename step (medium risk, reversible)", () => {
    const from = makeContract({ provides: { tables: ["old_x"] } });
    const to = makeContract({
      version: "0.2.0",
      provides: { tables: ["new_x"] },
      migrationFrom: { "0.1.0": "rename-2026-05" },
    });
    const plan = planMigration(diffContracts(from, to));
    expect(plan.steps).toHaveLength(1);
    const step = plan.steps[0];
    expect(step.kind).toBe("convex-schema-rename-table");
    expect(step.risk).toBe("medium");
    expect(step.reversible).toBe(true);
    expect(step.artifacts.convexMigration).toContain("old_x");
    expect(step.artifacts.convexMigration).toContain("new_x");
    expect(plan.summary.highRisk).toBe(0);
    expect(plan.summary.irreversible).toBe(0);
  });

  it("multiple env adds emit env-add steps with envExample artifacts", () => {
    const from = makeContract({ requires: { env: ["A"] } });
    const to = makeContract({
      version: "0.2.0",
      requires: { env: ["A", "B", "C"] },
    });
    const plan = planMigration(diffContracts(from, to));
    const envSteps = plan.steps.filter((s) => s.kind === "env-add");
    expect(envSteps).toHaveLength(2);
    for (const s of envSteps) {
      expect(s.artifacts.envExample).toBeDefined();
      expect(s.risk).toBe("low");
      expect(s.reversible).toBe(true);
    }
  });

  it("rbac add emits step with rbacPatch artifact", () => {
    const from = makeContract({ requires: { rbac: ["payment.refund"] } });
    const to = makeContract({
      version: "0.2.0",
      requires: { rbac: ["payment.refund", "payment.webhook-process"] },
    });
    const plan = planMigration(diffContracts(from, to));
    const rbac = plan.steps.find((s) => s.kind === "rbac-add-permission");
    expect(rbac).toBeDefined();
    expect(rbac.artifacts.rbacPatch).toContain("payment.webhook-process");
  });

  it("mixed: 2 added + 1 dropped table → 3 steps + correct summary", () => {
    const from = makeContract({ provides: { tables: ["a", "old"] } });
    const to = makeContract({
      version: "0.2.0",
      provides: { tables: ["a", "b", "c"] },
    });
    const plan = planMigration(diffContracts(from, to));
    expect(plan.summary.totalSteps).toBe(3);
    expect(plan.summary.highRisk).toBe(1); // the drop
    expect(plan.summary.irreversible).toBe(1);
    const kinds = plan.steps.map((s) => s.kind).sort();
    expect(kinds).toEqual([
      "convex-schema-add-table",
      "convex-schema-add-table",
      "convex-schema-drop-table",
    ]);
  });

  it("summary counts match drops (highRisk + irreversible)", () => {
    const from = makeContract({
      provides: { tables: ["x", "y", "z"] },
    });
    const to = makeContract({
      version: "0.2.0",
      provides: { tables: [] },
    });
    const plan = planMigration(diffContracts(from, to));
    expect(plan.summary.totalSteps).toBe(3);
    expect(plan.summary.highRisk).toBe(3);
    expect(plan.summary.irreversible).toBe(3);
    expect(plan.warnings.length).toBe(3);
  });

  it("step ids are unique + ordered (adds precede drops)", () => {
    const from = makeContract({
      provides: { tables: ["drop_me"] },
    });
    const to = makeContract({
      version: "0.2.0",
      provides: { tables: ["added_a", "added_b"] },
    });
    const plan = planMigration(diffContracts(from, to));
    const ids = plan.steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const kinds = plan.steps.map((s) => s.kind);
    const firstAdd = kinds.indexOf("convex-schema-add-table");
    const firstDrop = kinds.indexOf("convex-schema-drop-table");
    expect(firstAdd).toBeGreaterThanOrEqual(0);
    expect(firstDrop).toBeGreaterThanOrEqual(0);
    expect(firstAdd).toBeLessThan(firstDrop);
  });

  it("doku rename smoke: paymentOrders/paymentWebhookEvents → doku_orders/doku_webhook_events", () => {
    const from = {
      id: "doku-payment",
      version: "0.9.0",
      requires: { auth: "convex", env: [], rbac: [] },
      provides: {
        tables: ["paymentOrders", "paymentWebhookEvents"],
      },
    };
    const to = {
      id: "doku-payment",
      version: "0.1.0",
      requires: { auth: "convex", env: [], rbac: [] },
      provides: {
        tables: ["doku_orders", "doku_webhook_events"],
      },
      migrationFrom: { "0.9.0": "namespace-rename-2026-05" },
    };
    const plan = planMigration(diffContracts(from, to));
    const renameKinds = plan.steps.filter(
      (s) => s.kind === "convex-schema-rename-table",
    );
    expect(renameKinds).toHaveLength(2);
    const drops = plan.steps.filter(
      (s) => s.kind === "convex-schema-drop-table",
    );
    expect(drops).toHaveLength(0);
    // Reverse mapping present in artifacts
    expect(renameKinds[0].artifacts.convexMigration).toContain("paymentOrders");
    expect(renameKinds[0].artifacts.convexMigration).toContain("doku_orders");
  });
});

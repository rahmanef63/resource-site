/**
 * graph.test.ts — unit tests for graph invariant validation.
 */

import { describe, it, expect } from "vitest";
import { validateGraphRules } from "../validate/validateGraphRules";
import type { StudioUISchema } from "../types/studio";
import validFixture from "./fixtures/valid-ui-schema.json";
import invalidGraph from "./fixtures/invalid-graph.json";

// ─────────────────────────────────────────────────────────────────────────────
// Happy path
// ─────────────────────────────────────────────────────────────────────────────

describe("validateGraphRules — happy path", () => {
  it("passes valid schema with no issues", () => {
    const result = validateGraphRules(validFixture as unknown as StudioUISchema, "strict");
    expect(result.errors).toHaveLength(0);
  });

  it("computes correct stats", () => {
    const result = validateGraphRules(validFixture as unknown as StudioUISchema, "strict");
    expect(result.stats.nodeCount).toBe(Object.keys(validFixture.nodes).length);
    expect(result.stats.rootCount).toBe(1);
    expect(result.stats.maxDepth).toBeGreaterThan(0);
    expect(result.stats.orphanCount).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Missing root ID
// ─────────────────────────────────────────────────────────────────────────────

describe("validateGraphRules — UNKNOWN_ROOT_ID", () => {
  it("detects root ID not in nodes", () => {
    const result = validateGraphRules(invalidGraph as unknown as StudioUISchema, "strict");
    expect(result.errors.some(e => e.code === "UNKNOWN_ROOT_ID")).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Circular reference
// ─────────────────────────────────────────────────────────────────────────────

describe("validateGraphRules — CIRCULAR_REFERENCE", () => {
  it("detects A→B→A cycle", () => {
    const schema: StudioUISchema = {
      version: "0.5",
      root: ["a"],
      nodes: {
        a: { type: "div", props: {}, children: ["b"] },
        b: { type: "div", props: {}, children: ["a"] },
      },
    };
    const result = validateGraphRules(schema, "strict");
    expect(result.errors.some(e => e.code === "CIRCULAR_REFERENCE")).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Multiple parents
// ─────────────────────────────────────────────────────────────────────────────

describe("validateGraphRules — MULTIPLE_PARENTS", () => {
  it("detects child shared between two parents", () => {
    const schema: StudioUISchema = {
      version: "0.5",
      root: ["a", "b"],
      nodes: {
        a: { type: "div", props: {}, children: ["shared"] },
        b: { type: "div", props: {}, children: ["shared"] },
        shared: { type: "text", props: { content: "hi" }, children: [] },
      },
    };
    const result = validateGraphRules(schema, "strict");
    expect(result.errors.some(e => e.code === "MULTIPLE_PARENTS")).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Root has parent
// ─────────────────────────────────────────────────────────────────────────────

describe("validateGraphRules — ROOT_HAS_PARENT", () => {
  it("detects a root node that also appears as a child", () => {
    const schema: StudioUISchema = {
      version: "0.5",
      root: ["a", "b"],
      nodes: {
        a: { type: "div", props: {}, children: ["b"] },
        b: { type: "text", props: { content: "hi" }, children: [] },
      },
    };
    const result = validateGraphRules(schema, "strict");
    expect(result.errors.some(e => e.code === "ROOT_HAS_PARENT")).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Orphan node
// ─────────────────────────────────────────────────────────────────────────────

describe("validateGraphRules — ORPHAN_NODE", () => {
  it("produces error for orphan in strict mode", () => {
    const schema: StudioUISchema = {
      version: "0.5",
      root: ["a"],
      nodes: {
        a: { type: "div", props: {}, children: [] },
        orphan: { type: "text", props: { content: "lost" }, children: [] },
      },
    };
    const strict = validateGraphRules(schema, "strict");
    expect(strict.errors.some(e => e.code === "ORPHAN_NODE")).toBe(true);
  });

  it("produces warning for orphan in lenient mode", () => {
    const schema: StudioUISchema = {
      version: "0.5",
      root: ["a"],
      nodes: {
        a: { type: "div", props: {}, children: [] },
        orphan: { type: "text", props: { content: "lost" }, children: [] },
      },
    };
    const lenient = validateGraphRules(schema, "lenient");
    expect(lenient.errors.filter(e => e.code === "ORPHAN_NODE")).toHaveLength(0);
    expect(lenient.warnings.some(w => w.code === "ORPHAN_NODE")).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Missing child
// ─────────────────────────────────────────────────────────────────────────────

describe("validateGraphRules — UNKNOWN_CHILD_ID", () => {
  it("detects child ID not in nodes map", () => {
    const schema: StudioUISchema = {
      version: "0.5",
      root: ["parent"],
      nodes: {
        parent: { type: "div", props: {}, children: ["ghost-child"] },
      },
    };
    const result = validateGraphRules(schema, "strict");
    expect(result.errors.some(e => e.code === "UNKNOWN_CHILD_ID")).toBe(true);
  });
});

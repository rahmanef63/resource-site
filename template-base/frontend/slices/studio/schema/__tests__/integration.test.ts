/**
 * integration.test.ts — end-to-end pipeline tests.
 */

import { describe, it, expect } from "vitest";
import { validateStudioDocument } from "../validate/validateStudioDocument";
import validFixture from "./fixtures/valid-ui-schema.json";
import invalidGraph from "./fixtures/invalid-graph.json";
import invalidBusiness from "./fixtures/invalid-business.json";
import aliasInput from "./fixtures/alias-input.json";

// ─────────────────────────────────────────────────────────────────────────────
// Valid document
// ─────────────────────────────────────────────────────────────────────────────

describe("validateStudioDocument — valid document", () => {
  it("passes with zero errors (strict mode)", () => {
    const result = validateStudioDocument(validFixture, { mode: "strict" });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("passes with zero errors (lenient mode)", () => {
    const result = validateStudioDocument(validFixture, { mode: "lenient", normalize: true });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Graph violations
// ─────────────────────────────────────────────────────────────────────────────

describe("validateStudioDocument — graph violations", () => {
  it("detects missing root ID, circular reference, and orphan", () => {
    const result = validateStudioDocument(invalidGraph, { mode: "strict" });
    expect(result.valid).toBe(false);
    const codes = result.errors.map(e => e.code);
    expect(codes).toContain("UNKNOWN_ROOT_ID");
    // child-x → page-a → child-x is a cycle
    expect(codes).toContain("CIRCULAR_REFERENCE");
  });

  it("orphan produces warning in lenient mode", () => {
    // The invalid-graph fixture has orphan-node
    const result = validateStudioDocument(invalidGraph, { mode: "lenient" });
    expect(result.warnings.some(w => w.code === "ORPHAN_NODE")).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Business rule violations
// ─────────────────────────────────────────────────────────────────────────────

describe("validateStudioDocument — business rule violations", () => {
  it("detects INVALID_FLEX_DIRECTION (col instead of column)", () => {
    const result = validateStudioDocument(invalidBusiness, { mode: "strict" });
    expect(result.errors.some(e => e.code === "INVALID_FLEX_DIRECTION")).toBe(true);
  });

  it("detects INVALID_GAP_UNIT (bare number)", () => {
    const result = validateStudioDocument(invalidBusiness, { mode: "strict" });
    expect(result.errors.some(e => e.code === "INVALID_GAP_UNIT")).toBe(true);
  });

  it("detects SMART_BLOCK_NESTING", () => {
    const result = validateStudioDocument(invalidBusiness, { mode: "strict" });
    expect(result.errors.some(e => e.code === "SMART_BLOCK_NESTING")).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Alias normalisation (lenient)
// ─────────────────────────────────────────────────────────────────────────────

describe("validateStudioDocument — alias normalisation in lenient mode", () => {
  it("auto-resolves alias props and passes validation", () => {
    const result = validateStudioDocument(aliasInput, { mode: "lenient", normalize: true });
    // After normalisation, the schema should be valid
    expect(result.valid).toBe(true);
    // No alias errors — only alias warnings
    expect(result.errors.filter(e => e.code === "PROP_ALIAS_DETECTED")).toHaveLength(0);
  });

  it("rejects alias props in strict mode", () => {
    const result = validateStudioDocument(aliasInput, { mode: "strict", normalize: true });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === "PROP_ALIAS_DETECTED")).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Unknown format
// ─────────────────────────────────────────────────────────────────────────────

describe("validateStudioDocument — unknown format", () => {
  it("rejects null", () => {
    const result = validateStudioDocument(null);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === "INVALID_TOP_LEVEL_SHAPE")).toBe(true);
  });

  it("rejects a plain string", () => {
    const result = validateStudioDocument("not a schema");
    expect(result.valid).toBe(false);
  });

  it("rejects an empty object", () => {
    const result = validateStudioDocument({});
    expect(result.valid).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Studio Unified document
// ─────────────────────────────────────────────────────────────────────────────

describe("validateStudioDocument — unified document", () => {
  it("accepts a valid unified document with embedded ui", () => {
    const unified = {
      studioVersion: "1.0",
      kind: "ui-layout",
      metadata: {
        id: "test-001",
        name: "Test Layout",
        createdAt: "2026-04-06T00:00:00.000Z",
        updatedAt: "2026-04-06T00:00:00.000Z",
      },
      ui: {
        version: "0.5",
        root: ["hero"],
        nodes: {
          hero: {
            type: "section",
            props: { display: "flex", flexDirection: "column", path: "/", title: "Home" },
            children: [],
          },
        },
      },
    };
    const result = validateStudioDocument(unified, { mode: "strict" });
    expect(result.valid).toBe(true);
  });

  it("rejects unified with invalid kind", () => {
    const invalid = {
      studioVersion: "1.0",
      kind: "bad-kind",
      metadata: { id: "x", name: "x", createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    };
    const result = validateStudioDocument(invalid);
    expect(result.valid).toBe(false);
  });
});

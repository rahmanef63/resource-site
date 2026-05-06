/**
 * ajv.test.ts — structural validation via AJV JSON Schema.
 */

import { describe, it, expect } from "vitest";
import { validateUiWithAjv, validateStudioWithAjv } from "../validate/validateWithAjv";
import validFixture from "./fixtures/valid-ui-schema.json";

describe("validateUiWithAjv — UI schema", () => {
  it("accepts a valid v0.5 document", () => {
    const result = validateUiWithAjv(validFixture);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects null", () => {
    const result = validateUiWithAjv(null);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects missing version", () => {
    const doc = { root: ["n"], nodes: { n: { type: "div", children: [] } } };
    const result = validateUiWithAjv(doc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === "SCHEMA_REQUIRED")).toBe(true);
  });

  it("rejects invalid version string", () => {
    const doc = { version: "1.0", root: ["n"], nodes: { n: { type: "div", children: [] } } };
    const result = validateUiWithAjv(doc);
    expect(result.valid).toBe(false);
  });

  it("rejects empty root array", () => {
    const doc = { version: "0.5", root: [], nodes: { n: { type: "div", children: [] } } };
    const result = validateUiWithAjv(doc);
    expect(result.valid).toBe(false);
  });

  it("rejects node ID that fails pattern", () => {
    const doc = {
      version: "0.5",
      root: ["Bad_ID"],
      nodes: { "Bad_ID": { type: "div", children: [] } },
    };
    const result = validateUiWithAjv(doc);
    expect(result.valid).toBe(false);
  });
});

describe("validateStudioWithAjv — Unified document", () => {
  it("accepts a valid unified document", () => {
    const doc = {
      studioVersion: "1.0",
      kind: "workflow",
      metadata: { id: "abc", name: "Test", createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    };
    const result = validateStudioWithAjv(doc);
    expect(result.valid).toBe(true);
  });

  it("rejects invalid kind", () => {
    const doc = {
      studioVersion: "1.0",
      kind: "invalid-kind",
      metadata: { id: "abc", name: "Test", createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    };
    const result = validateStudioWithAjv(doc);
    expect(result.valid).toBe(false);
  });

  it("rejects missing metadata", () => {
    const doc = { studioVersion: "1.0", kind: "workflow" };
    const result = validateStudioWithAjv(doc);
    expect(result.valid).toBe(false);
  });
});

/**
 * normalize.test.ts — unit tests for the normalisation pipeline.
 */

import { describe, it, expect } from "vitest";
import { normalizeNodeProps } from "../normalize/normalizeNodeProps";
import { normalizeUiSchema } from "../normalize/normalizeUiSchema";
import aliasInput from "./fixtures/alias-input.json";

// ─────────────────────────────────────────────────────────────────────────────
// normalizeNodeProps
// ─────────────────────────────────────────────────────────────────────────────

describe("normalizeNodeProps — lenient mode", () => {
  it("resolves direction → flexDirection", () => {
    const { props, issues } = normalizeNodeProps("hero", { direction: "row" }, "lenient");
    expect(props.flexDirection).toBe("row");
    expect(props.direction).toBeUndefined();
    expect(issues.some(i => i.code === "PROP_ALIAS_NORMALISED")).toBe(true);
  });

  it("resolves align → alignItems", () => {
    const { props } = normalizeNodeProps("n", { align: "center" }, "lenient");
    expect(props.alignItems).toBe("center");
    expect(props.align).toBeUndefined();
  });

  it("resolves justify → justifyContent", () => {
    const { props } = normalizeNodeProps("n", { justify: "space-between" }, "lenient");
    expect(props.justifyContent).toBe("space-between");
  });

  it("resolves wrap → flexWrap", () => {
    const { props } = normalizeNodeProps("n", { wrap: "wrap" }, "lenient");
    expect(props.flexWrap).toBe("wrap");
  });

  it("resolves t-shirt gap size lg → 1.5rem", () => {
    const { props, issues } = normalizeNodeProps("n", { gap: "lg" }, "lenient");
    expect(props.gap).toBe("1.5rem");
    expect(issues.some(i => i.code === "PROP_ALIAS_NORMALISED")).toBe(true);
  });

  it("resolves background → backgroundColor", () => {
    const { props } = normalizeNodeProps("n", { background: "#fff" }, "lenient");
    expect(props.backgroundColor).toBe("#fff");
  });

  it("normalises text → content for text widgets", () => {
    const { props, issues } = normalizeNodeProps("copy", { text: "Hero heading" }, "lenient", "text");
    expect(props.content).toBe("Hero heading");
    expect(props.text).toBeUndefined();
    expect(issues.some((issue) => issue.message.includes('"text" to "content"'))).toBe(true);
  });

  it("normalises backgroundColor → color for text widgets", () => {
    const { props, issues } = normalizeNodeProps("copy", { backgroundColor: "#111827" }, "lenient", "text");
    expect(props.color).toBe("#111827");
    expect(props.backgroundColor).toBeUndefined();
    expect(issues.some((issue) => issue.message.includes('"backgroundColor" to "color"'))).toBe(true);
  });

  it("does not overwrite existing canonical prop", () => {
    const { props } = normalizeNodeProps("n", {
      direction: "row",
      flexDirection: "column",
    }, "lenient");
    expect(props.flexDirection).toBe("column"); // existing wins
  });
});

describe("normalizeNodeProps — button/badge widget normalization", () => {
  it("normalises button content → text in lenient mode", () => {
    const { props, issues } = normalizeNodeProps("btn", { content: "Click me" }, "lenient", "button");
    expect(props.text).toBe("Click me");
    expect(props.content).toBeUndefined();
    expect(issues.some(i => i.message.includes('"content" to "text"'))).toBe(true);
  });

  it("does not overwrite existing button text prop", () => {
    const { props } = normalizeNodeProps("btn", { content: "Should be ignored", text: "Actual label" }, "lenient", "button");
    expect(props.text).toBe("Actual label");
    expect(props.content).toBeUndefined();
  });

  it("normalises badge content → label in lenient mode", () => {
    const { props, issues } = normalizeNodeProps("badge1", { content: "New" }, "lenient", "badge");
    expect(props.label).toBe("New");
    expect(props.content).toBeUndefined();
    expect(issues.some(i => i.message.includes('"content" to "label"'))).toBe(true);
  });

  it("does not overwrite existing badge label prop", () => {
    const { props } = normalizeNodeProps("badge1", { content: "Ignored", label: "Active" }, "lenient", "badge");
    expect(props.label).toBe("Active");
    expect(props.content).toBeUndefined();
  });

  it("emits error for button content in strict mode", () => {
    const { issues } = normalizeNodeProps("btn", { content: "Post" }, "strict", "button");
    expect(issues.some(i => i.code === "PROP_ALIAS_DETECTED" && i.severity === "error")).toBe(true);
  });

  it("emits error for badge content in strict mode", () => {
    const { issues } = normalizeNodeProps("b", { content: "3" }, "strict", "badge");
    expect(issues.some(i => i.code === "PROP_ALIAS_DETECTED" && i.severity === "error")).toBe(true);
  });
});

describe("normalizeNodeProps — strict mode", () => {
  it("emits error for alias in strict mode", () => {
    const { issues } = normalizeNodeProps("hero", { direction: "row" }, "strict");
    expect(issues.some(i => i.code === "PROP_ALIAS_DETECTED" && i.severity === "error")).toBe(true);
  });

  it("emits error for text alias in strict mode", () => {
    const { issues } = normalizeNodeProps("hero", { text: "Heading" }, "strict", "text");
    expect(issues.some((issue) => issue.code === "PROP_ALIAS_DETECTED" && issue.message.includes('"content"'))).toBe(true);
  });

  it("emits error for bare number gap in strict mode", () => {
    const { issues } = normalizeNodeProps("hero", { gap: "16" }, "strict");
    expect(issues.some(i => i.code === "INVALID_CSS_LENGTH" && i.severity === "error")).toBe(true);
  });

  it("does not emit error for valid CSS gap in strict mode", () => {
    const { issues } = normalizeNodeProps("hero", { gap: "1rem" }, "strict");
    expect(issues.filter(i => i.code === "INVALID_CSS_LENGTH")).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// normalizeUiSchema
// ─────────────────────────────────────────────────────────────────────────────

describe("normalizeUiSchema", () => {
  it("normalises alias props in all nodes (lenient)", () => {
    const result = normalizeUiSchema(aliasInput, "lenient");
    const hero = (result.document?.nodes ?? {})["hero"];
    expect(hero?.props.flexDirection).toBe("row");
    expect(hero?.props.alignItems).toBe("center");
    expect(hero?.props.justifyContent).toBe("space-between");
    expect(hero?.props.flexWrap).toBe("wrap");
    expect(hero?.props.gap).toBe("1.5rem"); // lg → 1.5rem
    expect(hero?.props.backgroundColor).toBe("#f9fafb");
    expect(hero?.props.direction).toBeUndefined();
  });

  it("returns null document for non-object input", () => {
    const result = normalizeUiSchema("not an object", "lenient");
    expect(result.document).toBeNull();
    expect(result.errors.some(e => e.code === "INVALID_TOP_LEVEL_SHAPE")).toBe(true);
  });

  it("migrates v0.4 and adds warnings", () => {
    const v04 = { version: "0.4", root: ["n1"], nodes: { "n1": { type: "div", props: {}, children: [] } } };
    const result = normalizeUiSchema(v04, "lenient");
    expect(result.warnings.some(w => w.code === "MIGRATION_V04_TO_V05")).toBe(true);
  });
});

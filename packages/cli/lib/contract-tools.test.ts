import { describe, it, expect } from "vitest";
import { defineSliceContract } from "./contract";

const base = {
  id: "foo",
  version: "1.0.0",
  requires: {},
  provides: {},
};

describe("defineSliceContract — provides.tools (agentic surface)", () => {
  it("accepts tool names prefixed with the slice id", () => {
    expect(() =>
      defineSliceContract({
        ...base,
        provides: { tools: ["foo.bar", "foo.baz.qux"] },
      }),
    ).not.toThrow();
  });

  it("rejects tool names not prefixed with the slice id", () => {
    expect(() =>
      defineSliceContract({
        ...base,
        provides: { tools: ["bar.baz"] },
      }),
    ).toThrow(/must be prefixed with "foo\."/);
  });

  it("rejects non-string / empty tool entries", () => {
    expect(() =>
      defineSliceContract({
        ...base,
        provides: { tools: [""] as string[] },
      }),
    ).toThrow(/non-empty strings/);
  });

  it("allows tools to be omitted (non-agentic slices)", () => {
    expect(() => defineSliceContract({ ...base })).not.toThrow();
  });

  it("allows a conflict to reference a tool name", () => {
    expect(() =>
      defineSliceContract({
        ...base,
        provides: { tools: ["foo.bar"] },
        conflicts: ["other:tools.foo.bar"],
      }),
    ).not.toThrow();
  });
});

import { describe, expect, it } from "vitest";
import { normalizeResourceInput, sortResources, swapResourceOrder } from "./core";

describe("resources launcher core", () => {
  it("normalizes editable values without framework state", () => {
    expect(normalizeResourceInput({ label: " Docs ", icon: "", url: " https://example.com ", group: " ", order: Number.NaN })).toEqual({
      label: "Docs",
      icon: "Link",
      url: "https://example.com",
      group: "Links",
      order: 0,
    });
  });

  it("sorts deterministically and swaps adjacent order values", () => {
    const rows = [
      { id: "b", label: "B", icon: "Link", url: "#b", group: "Links", order: 2 },
      { id: "a", label: "A", icon: "Link", url: "#a", group: "Links", order: 1 },
    ];
    const sorted = sortResources(rows);
    expect(sorted.map((row) => row.id)).toEqual(["a", "b"]);
    expect(swapResourceOrder(sorted, 0, 1)?.map((row) => row.order)).toEqual([2, 1]);
    expect(swapResourceOrder(sorted, 0, -1)).toBeNull();
  });
});

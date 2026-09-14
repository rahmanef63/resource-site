import { describe, expect, it } from "vitest";
import { blankSection, moveLandingSection, sortedLandingSections, visibleLandingCount, type LandingStore } from "./core";
import type { LandingSection } from "../types";

const item = (id: string, order: number, enabled = true): LandingSection => ({ id, order, kind: "custom", title: id, enabled });

describe("sections core", () => {
  it("creates deterministic blank sections when an id is provided", () => {
    expect(blankSection(4, "new-id")).toMatchObject({ id: "new-id", order: 5, kind: "custom", enabled: true, imageRatio: "16:9" });
  });

  it("sorts, counts visibility, and swaps adjacent order through the store adapter", () => {
    const items = [item("b", 2, false), item("a", 1), item("c", 3)];
    const updates: Array<[string, number]> = [];
    const store: LandingStore = {
      items,
      publicBase: "/",
      adminBase: "/admin",
      create: () => {},
      update: (id, patch) => updates.push([id, patch.order ?? -1]),
      remove: () => {},
    };
    expect(sortedLandingSections(items).map((entry) => entry.id)).toEqual(["a", "b", "c"]);
    expect(visibleLandingCount(items)).toBe(2);
    expect(moveLandingSection(store, "b", -1)).toBe(true);
    expect(updates).toEqual([["b", 1], ["a", 2]]);
  });
});

import { describe, expect, it } from "vitest";
import { DEFAULT_CATEGORY_LABELS, DEFAULT_COPY } from "./defaults";
import { activityStatItems } from "./stats";

describe("activityStatItems", () => {
  it("keeps entries first, rounds hours, then sorts categories by count", () => {
    expect(activityStatItems(
      { count: 4, totalMinutes: 95, byCategory: { learn: 1, code: 2, ship: 1 } },
      DEFAULT_COPY,
      DEFAULT_CATEGORY_LABELS,
    )).toEqual([
      { key: "entries", label: "Total entries", value: "4" },
      { key: "duration", label: "Total duration", value: "2h" },
      { key: "category:code", label: "Code", value: "2" },
      { key: "category:learn", label: "Learn", value: "1" },
      { key: "category:ship", label: "Ship", value: "1" },
    ]);
  });

  it("omits duration when no minutes were recorded", () => {
    const items = activityStatItems(
      { count: 1, totalMinutes: 0, byCategory: { ops: 1 } },
      DEFAULT_COPY,
      DEFAULT_CATEGORY_LABELS,
    );
    expect(items.some((item) => item.key === "duration")).toBe(false);
  });
});

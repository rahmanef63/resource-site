import { describe, expect, it } from "vitest";
import { groupByWeek, isoWeek } from "./grouping";
import type { ActivityRow } from "./types";

function row(id: string, occurredAt: string): ActivityRow {
  return {
    _id: id,
    title: id,
    summary: "",
    category: "code",
    source: "manual",
    occurredAt: Date.parse(occurredAt),
  };
}

describe("activity ISO-week grouping", () => {
  it("handles ISO year boundaries", () => {
    expect(isoWeek(new Date("2026-01-01T12:00:00Z"))).toEqual({ year: 2026, week: 1 });
    expect(isoWeek(new Date("2025-12-31T12:00:00Z"))).toEqual({ year: 2026, week: 1 });
  });

  it("sorts newest weeks and newest rows first", () => {
    const groups = groupByWeek(
      [
        row("older-week", "2026-05-20T10:00:00Z"),
        row("same-week-old", "2026-06-01T09:00:00Z"),
        row("same-week-new", "2026-06-02T09:00:00Z"),
      ],
      "{year} · Week {week}",
    );
    expect(groups[0].rows.map((item) => item._id)).toEqual(["same-week-new", "same-week-old"]);
    expect(groups[1].rows.map((item) => item._id)).toEqual(["older-week"]);
  });
});

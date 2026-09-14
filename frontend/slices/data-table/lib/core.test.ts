import { describe, expect, it } from "vitest";
import {
  DEFAULT_DATA_TABLE_LABELS,
  dataTableCellPadding,
  dataTablePageSummary,
  dataTableRowSummary,
  resolveDataTableLabels,
} from "./core";

describe("data-table core", () => {
  it("resolves additive labels without mutating defaults", () => {
    const labels = resolveDataTableLabels({ next: "Lanjut" });
    expect(labels.next).toBe("Lanjut");
    expect(labels.previous).toBe(DEFAULT_DATA_TABLE_LABELS.previous);
    expect(DEFAULT_DATA_TABLE_LABELS.next).toBe("Next");
  });

  it("maps density to the canonical cell padding", () => {
    expect(dataTableCellPadding("compact")).toBe("py-1");
    expect(dataTableCellPadding("comfortable")).toBe("py-2.5");
  });

  it("formats row and page summaries consistently", () => {
    const labels = resolveDataTableLabels();
    expect(dataTableRowSummary(12, 3, true, labels)).toBe("3 of 12 selected");
    expect(dataTableRowSummary(12, 0, false, labels)).toBe("12 row(s)");
    expect(dataTablePageSummary(1, 4, labels)).toBe("Page 2 of 4");
  });
});

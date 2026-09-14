export type DataTableDensity = "compact" | "comfortable";

export type DataTableLabels = {
  searchPlaceholder: string;
  view: string;
  toggleColumns: string;
  noResults: string;
  previous: string;
  next: string;
  page: string;
  of: string;
  rows: string;
  selected: string;
  selectAllRows: string;
  selectRow: string;
};

export const DEFAULT_DATA_TABLE_LABELS: DataTableLabels = {
  searchPlaceholder: "Search…",
  view: "View",
  toggleColumns: "Toggle columns",
  noResults: "No results.",
  previous: "Previous",
  next: "Next",
  page: "Page",
  of: "of",
  rows: "row(s)",
  selected: "selected",
  selectAllRows: "Select all rows",
  selectRow: "Select row",
};

export function resolveDataTableLabels(
  labels?: Partial<DataTableLabels>,
): DataTableLabels {
  return { ...DEFAULT_DATA_TABLE_LABELS, ...labels };
}

export function dataTableCellPadding(density: DataTableDensity): string {
  return density === "compact" ? "py-1" : "py-2.5";
}

export function dataTableRowSummary(
  total: number,
  selected: number,
  selectable: boolean,
  labels: DataTableLabels,
): string {
  return selectable
    ? `${selected} ${labels.of} ${total} ${labels.selected}`
    : `${total} ${labels.rows}`;
}

export function dataTablePageSummary(
  pageIndex: number,
  pageCount: number,
  labels: DataTableLabels,
): string {
  return `${labels.page} ${pageIndex + 1} ${labels.of} ${Math.max(pageCount, 1)}`;
}

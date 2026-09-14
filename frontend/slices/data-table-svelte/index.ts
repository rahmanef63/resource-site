export { default as DataTable } from "./components/DataTable.svelte";
export { default as DataTableColumnHeader } from "./components/DataTableColumnHeader.svelte";
export { default as DataTablePagination } from "./components/DataTablePagination.svelte";
export { default as DataTableToolbar } from "./components/DataTableToolbar.svelte";
export { dataTableFeature } from "./config";
export {
  dataTableFeatures,
  type DataTableColumn,
  type DataTableColumnInstance,
  type DataTableInstance,
} from "./lib/table";
export {
  DEFAULT_DATA_TABLE_LABELS,
  dataTableCellPadding,
  dataTablePageSummary,
  dataTableRowSummary,
  resolveDataTableLabels,
  type DataTableDensity,
  type DataTableLabels,
} from "../data-table/lib/core";

export { dataTableFeature } from "./config";
export { DataTable, type DataTableProps } from "./components/DataTable";
export {
  DataTableToolbar,
  type DataTableToolbarProps,
} from "./components/data-table-toolbar";
export {
  DataTablePagination,
  type DataTablePaginationProps,
} from "./components/data-table-pagination";
export {
  DataTableColumnHeader,
  type DataTableColumnHeaderProps,
} from "./components/data-table-column-header";
export { selectionColumn } from "./lib/columns-helpers";

export {
  DEFAULT_DATA_TABLE_LABELS,
  dataTableCellPadding,
  dataTablePageSummary,
  dataTableRowSummary,
  resolveDataTableLabels,
  type DataTableDensity,
  type DataTableLabels,
} from "./lib/core";

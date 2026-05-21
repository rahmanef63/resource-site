/** database-json — JSON import/export for notion-database.
 *
 *  Standalone peer slice. Pure / props-driven — host wires onImport to
 *  its own adapter (callback receives {newProperties, rows, importedDb};
 *  host translates to addProperty + addRow + setRowValue against its
 *  store).
 *
 *  Result shape is the SAME as CsvImportResult so a single host handler
 *  can serve both CSV + JSON.
 *
 *  Peer: notion-database (uses Database, Page, Property, PropertyType,
 *  PropertyValue, SelectOption, DatabaseViewConfig types). */

export { JsonActions, type JsonActionsProps } from "./components/JsonActions";
export {
  JsonImportDialog, type JsonImportDialogProps,
} from "./components/JsonImportDialog";
export {
  exportDatabase, downloadJson, parseExport, diffSchema, buildImportResult,
  type DatabaseExportV1, type RowExport, type JsonImportResult,
} from "./lib/serialize";

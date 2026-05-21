/** database-csv — CSV import/export for notion-database.
 *
 *  Standalone peer slice. Pure / props-driven — host wires onImport to
 *  its own adapter (callback receives {newProperties, rows}; host
 *  translates to addProperty + addRow + setRowValue against its store).
 *
 *  Peer: notion-database (uses Database, Property, PropertyValue,
 *  PropertyType, SelectOption types). */

export { CsvActions, type CsvActionsProps } from "./components/CsvActions";
export {
  CsvImportDialog,
  type CsvImportDialogProps,
  type CsvImportResult,
  type CsvNewProperty,
  type CsvRowDraft,
} from "./components/CsvImportDialog";
export {
  exportDatabaseToCsv, parseCsv, downloadCsv, valueFromString,
  type ParsedCsv,
} from "./lib/csv";

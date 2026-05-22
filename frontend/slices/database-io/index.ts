/** database-io — combined CSV + JSON import/export with dynamic template
 *  generation for notion-database. CK-1E (2026-05-22) — merges +
 *  replaces standalone database-csv + database-json. */

export {
  DatabaseIOActions,
  type DatabaseIOActionsProps,
} from "./components/DatabaseIOActions";

export {
  CsvImportDialog,
  type CsvImportDialogProps,
  type CsvImportResult,
  type CsvNewProperty,
  type CsvRowDraft,
} from "./components/CsvImportDialog";

export {
  JsonImportDialog,
  type JsonImportDialogProps,
} from "./components/JsonImportDialog";

export {
  exportDatabaseToCsv, parseCsv, downloadCsv, valueFromString,
  type ParsedCsv,
} from "./lib/csv";

export {
  exportDatabase, downloadJson, parseExport, diffSchema, buildImportResult,
  type DatabaseExportV1, type RowExport, type JsonImportResult,
} from "./lib/serialize";

export { buildCsvTemplate, buildJsonTemplate } from "./lib/template";

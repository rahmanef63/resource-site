/** @deprecated database-io merged into notion-database v0.6 (Phase 7.10,
 *  2026-05-22). This shim re-exports the new locations so existing
 *  consumers keep compiling. Migrate to `@/features/notion-database`
 *  for new code — this slice will be removed in v1.0.
 *
 *  Old:  import { DatabaseIOActions } from "@/features/database-io";
 *  New:  import { DatabaseIOActions } from "@/features/notion-database";
 *
 *  Merge rationale:
 *  - Single-slice install path (`npx rr add notion-database` now
 *    bundles import/export — no separate `database-io` install needed).
 *  - All IO ops inherently tied to a notion-database surface (db schema
 *    + rows) — separating them created 2-slice install friction with
 *    zero modularity benefit.
 *  - DatabaseIOActions / Csv / Json dialogs imported notion-database
 *    Database / Page / Property types in every file — peer coupling
 *    was already 100%.
 */

export {
  DatabaseIOActions,
  type DatabaseIOActionsProps,
  CsvImportDialog,
  type CsvImportDialogProps,
  type CsvImportResult,
  type CsvNewProperty,
  type CsvRowDraft,
  JsonImportDialog,
  type JsonImportDialogProps,
  exportDatabaseToCsv,
  parseCsv,
  downloadCsv,
  valueFromString,
  type ParsedCsv,
  exportDatabase,
  downloadJson,
  parseExport,
  diffSchema,
  buildImportResult,
  type DatabaseExportV1,
  type RowExport,
  type JsonImportResult,
  buildCsvTemplate,
  buildJsonTemplate,
} from "@/features/notion-database";

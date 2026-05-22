/**
 * database-io — combined CSV + JSON import/export with dynamic template
 * generation for notion-database. Replaces standalone database-csv +
 * database-json (CK-1E).
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "database-io",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["DatabaseIOActions", "CsvImportDialog", "JsonImportDialog"],
    utils: [
      "exportDatabaseToCsv", "parseCsv", "downloadCsv", "valueFromString",
      "exportDatabase", "downloadJson", "parseExport", "diffSchema", "buildImportResult",
      "buildCsvTemplate", "buildJsonTemplate",
    ],
    hooks: [],
    types: [
      "DatabaseIOActionsProps",
      "CsvImportDialogProps", "CsvImportResult", "CsvNewProperty", "CsvRowDraft", "ParsedCsv",
      "JsonImportDialogProps", "JsonImportResult", "DatabaseExportV1", "RowExport",
    ],
  },
  requires: {
    npm: [],
    shadcn: ["button", "dialog", "dropdown-menu"],
    env: [],
    peers: [{ slug: "notion-database", range: "^0.3" }],
    routes: [],
    tables: [],
  },
});

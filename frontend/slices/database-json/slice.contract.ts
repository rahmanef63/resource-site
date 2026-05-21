/**
 * database-json — JSON import/export for notion-database.
 *
 * Pure / props-driven. JsonActions ships dropdown w/ Export + Import
 * items. JsonImportDialog parses a previously-exported `.json` (wire
 * format v1), diffs schema against existing db.properties, then emits
 * a single onImport callback ({newProperties, rows, importedDb}).
 *
 * Result shape mirrors CsvImportResult so a single host handler can
 * serve both CSV + JSON imports.
 *
 * Peer slice: notion-database.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "database-json",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["JsonActions", "JsonImportDialog"],
    utils: [
      "exportDatabase", "downloadJson", "parseExport",
      "diffSchema", "buildImportResult",
    ],
    hooks: [],
    types: [
      "JsonActionsProps", "JsonImportDialogProps",
      "JsonImportResult", "DatabaseExportV1", "RowExport",
    ],
  },
  requires: {
    npm: [],
    shadcn: ["button", "dialog", "dropdown-menu"],
    env: [],
    peers: [{ slug: "notion-database", range: "^0.4" }],
    routes: [],
    tables: [],
  },
});

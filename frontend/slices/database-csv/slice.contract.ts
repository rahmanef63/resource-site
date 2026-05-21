/**
 * database-csv — CSV import/export for notion-database.
 *
 * Pure / props-driven. CsvActions ships dropdown w/ Export + Import
 * items. CsvImportDialog parses + maps CSV columns to db properties
 * then emits a single onImport callback ({newProperties, rows}) so
 * the host owns persistence.
 *
 * Peer slice: notion-database (uses Database / Property / PropertyValue
 * / PropertyType / SelectOption types).
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "database-csv",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["CsvActions", "CsvImportDialog"],
    utils: ["exportDatabaseToCsv", "parseCsv", "downloadCsv", "valueFromString"],
    hooks: [],
    types: [
      "CsvActionsProps", "CsvImportDialogProps",
      "CsvImportResult", "CsvNewProperty", "CsvRowDraft", "ParsedCsv",
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

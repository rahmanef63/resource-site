"use client";

/** CsvActions — dropdown trigger with Export + Import items. Self-
 *  contained: owns the CsvImportDialog open state. Host wires `onImport`
 *  to its own store / adapter (props-driven, no useStore). */

import { useState } from "react";
import { Download, Upload } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Database, Page } from "../types";
import { downloadCsv, exportDatabaseToCsv } from "../lib/csv";
import { CsvImportDialog, type CsvImportResult } from "./CsvImportDialog";

export interface CsvActionsProps {
  db: Database;
  rows: Page[];
  onImport: (result: CsvImportResult) => Promise<void> | void;
  className?: string;
}

export function CsvActions({ db, rows, onImport, className }: CsvActionsProps) {
  const [importOpen, setImportOpen] = useState(false);

  const onExport = () => {
    const csv = exportDatabaseToCsv(db, rows);
    downloadCsv(`${db.name || "database"}.csv`, csv);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={
              className
              ?? "flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
            }
            aria-label="CSV import / export"
          >
            CSV
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs">Data</DropdownMenuLabel>
          <DropdownMenuItem onClick={onExport}>
            <Download className="mr-2 h-3.5 w-3.5" />
            Export {rows.length} row{rows.length === 1 ? "" : "s"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 h-3.5 w-3.5" /> Import CSV…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CsvImportDialog db={db} open={importOpen} onOpenChange={setImportOpen} onImport={onImport} />
    </>
  );
}

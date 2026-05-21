"use client";

/** JsonActions — dropdown trigger with Export + Import items.
 *  Self-contained: owns the JsonImportDialog open state. Host wires
 *  `onImport` to its own store / adapter. Mirrors database-csv's
 *  CsvActions for symmetry. */

import { useState } from "react";
import { Download, Upload } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Database, Page } from "../types";
import { downloadJson, exportDatabase } from "../lib/serialize";
import {
  JsonImportDialog, type JsonImportDialogProps,
} from "./JsonImportDialog";

export interface JsonActionsProps {
  db: Database;
  rows: Page[];
  onImport: JsonImportDialogProps["onImport"];
  className?: string;
}

export function JsonActions({ db, rows, onImport, className }: JsonActionsProps) {
  const [importOpen, setImportOpen] = useState(false);

  const onExport = () => {
    const json = exportDatabase(db, rows);
    downloadJson(`${db.name || "database"}.json`, json);
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
            aria-label="JSON import / export"
          >
            JSON
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs">Data</DropdownMenuLabel>
          <DropdownMenuItem onClick={onExport}>
            <Download className="mr-2 h-3.5 w-3.5" />
            Export {rows.length} row{rows.length === 1 ? "" : "s"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setImportOpen(true)}>
            <Upload className="mr-2 h-3.5 w-3.5" /> Import JSON…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <JsonImportDialog db={db} open={importOpen} onOpenChange={setImportOpen} onImport={onImport} />
    </>
  );
}

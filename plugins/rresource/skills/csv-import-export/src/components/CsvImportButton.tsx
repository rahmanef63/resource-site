// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import type { ZodType } from "zod";
import { parseCsvFile } from "../lib/csv";

type Props<T> = {
  schema?: ZodType<T>;
  onRows: (rows: T[]) => void;
  onError?: (errors: string[]) => void;
  className?: string;
  children?: React.ReactNode;
};

export function CsvImportButton<T>({ schema, onRows, onError, className, children = "Import CSV" }: Props<T>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const { rows, errors } = await parseCsvFile<T>(f, schema);
          if (errors.length && onError) onError(errors);
          onRows(rows);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <button type="button" className={className} onClick={() => inputRef.current?.click()}>
        {children}
      </button>
    </>
  );
}

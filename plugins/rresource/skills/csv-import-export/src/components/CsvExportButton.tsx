// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import { downloadAsCsv } from "../lib/csv";

type Props<T extends Record<string, unknown>> = {
  rows: T[] | (() => T[]);
  filename: string;
  className?: string;
  children?: React.ReactNode;
};

export function CsvExportButton<T extends Record<string, unknown>>({
  rows, filename, className, children = "Export CSV",
}: Props<T>) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => downloadAsCsv(filename, typeof rows === "function" ? rows() : rows)}
    >
      {children}
    </button>
  );
}

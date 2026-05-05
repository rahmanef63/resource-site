// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import { generatePdfFromElement, type PdfOptions } from "../lib/pdf";

type Props = PdfOptions & {
  target: React.RefObject<HTMLElement>;
  children?: React.ReactNode;
  className?: string;
};

export function DownloadPdfButton({ target, children = "Download PDF", className, ...opts }: Props) {
  const [busy, setBusy] = React.useState(false);
  return (
    <button
      type="button"
      disabled={busy || !target.current}
      onClick={async () => {
        if (!target.current) return;
        setBusy(true);
        try { await generatePdfFromElement(target.current, opts); } finally { setBusy(false); }
      }}
      className={className}
    >
      {busy ? "Generating…" : children}
    </button>
  );
}

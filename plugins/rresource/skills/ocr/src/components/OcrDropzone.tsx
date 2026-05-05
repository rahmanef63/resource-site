// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

"use client";
import * as React from "react";
import { runOcr } from "../lib/ocr";

type Props = {
  lang?: string;
  onText: (text: string) => void;
  className?: string;
  children?: React.ReactNode;
};

export function OcrDropzone({ lang = "ind+eng", onText, className, children }: Props) {
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handle(file: File) {
    setBusy(true);
    try {
      const text = await runOcr(file, { lang });
      onText(text);
    } finally { setBusy(false); }
  }

  return (
    <div
      className={className}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) handle(f);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])}
      />
      {busy ? "Reading image…" : (children ?? "Drop image or click")}
    </div>
  );
}

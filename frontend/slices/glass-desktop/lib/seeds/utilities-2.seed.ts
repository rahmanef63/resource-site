// glass-desktop — seed copy for the "utilities-2" widget batch (Build Plan §7,
// rows 35–37: file-search / web-search / palette). LOC-exempt data module —
// widgets read from here so the TSX carries no literals. Fictional file names
// only (IP guardrail). Accent values mirror the token SSOT (§ globals.css).

/** file-search (WP) — one seeded file surfaced in the results overlay. */
export interface FileSeed {
  id: string;
  name: string;
  kind: string; // human-readable type, e.g. "PDF document"
  meta: string; // secondary line, e.g. size · modified
}

export const fileSearchSeed = {
  placeholder: "Find files…",
  enterHint: "⏎",
  emptyLabel: "No files match",
  resultsLabel: "Files",
  files: [
    { id: "roadmap", name: "Roadmap Q3.pdf", kind: "PDF document", meta: "1.2 MB · yesterday" },
    { id: "moodboard", name: "Moodboard.fig", kind: "Figma file", meta: "8.4 MB · 2 days ago" },
    { id: "budget", name: "Budget 2026.xlsx", kind: "Spreadsheet", meta: "244 KB · last week" },
    { id: "notes", name: "Standup notes.md", kind: "Markdown", meta: "6 KB · today" },
    { id: "cover", name: "Cover render.png", kind: "PNG image", meta: "3.1 MB · 3 days ago" },
    { id: "contract", name: "Northline contract.docx", kind: "Document", meta: "88 KB · last month" },
  ] as FileSeed[],
};

/** web-search (WP) — Input + demo-only submit toast (no network by design). */
export const webSearchSeed = {
  placeholder: "Search web…",
  toast: "Demo surface — no network",
};

/** palette (S) — four accent swatches; caption is the oklch value that is
 *  copied to the clipboard on click. `token` drives the swatch fill. */
export interface SwatchSeed {
  id: string;
  label: string;
  token: string; // CSS custom property backing the swatch fill
  value: string; // oklch caption + clipboard payload
}

export const paletteSeed = {
  title: "Accents",
  copiedLabel: "Copied",
  swatches: [
    { id: "blue", label: "Blue", token: "var(--color-accent-blue)", value: "oklch(78% 0.14 250)" },
    { id: "green", label: "Green", token: "var(--color-accent-green)", value: "oklch(78% 0.14 155)" },
    { id: "amber", label: "Amber", token: "var(--color-accent-amber)", value: "oklch(78% 0.14 75)" },
    { id: "coral", label: "Coral", token: "var(--color-accent-coral)", value: "oklch(78% 0.14 25)" },
  ] as SwatchSeed[],
};

// AZ-wave types: split out of `types.ts` (LOC cap).
// Re-exported by `types.ts` so existing imports keep working.

/** Scheduled client sessions + project deadlines (admin calendar). */
export type CalendarEventKind = "session" | "deadline" | "workshop" | "internal";
export type CalendarEvent = {
  id: string;
  title: string;
  clientId?: string;
  projectId?: string;
  kind: CalendarEventKind;
  /** 0–6, Sunday=0. Used to place in week grid. */
  dayOfWeek: number;
  /** Hour 0–23 (start). */
  hour: number;
  durationHours: number;
  location: string; // "Zoom" / "Kantor klien" / "SCBD Office"
  notes?: string;
};

/** Internal playbook articles for the consulting practice. */
export type KbCategory = "Strategi" | "Operasi" | "Organisasi" | "M&A" | "Workshop" | "Template";
export type KbStatus = "draft" | "published" | "archived";
export type KbArticle = {
  id: string;
  slug: string;
  title: string;
  category: KbCategory;
  summary: string;
  /** Paragraphs separated by blank line ("\n\n"). Kept as string for
   *  editor-friendliness (textarea round-trip). Split at render time. */
  body: string;
  author: string;
  updatedAt: number;
  status: KbStatus;
};

/** Derived analytics KPI tile shape (computed inside view, not stored). */
export type AnalyticsKpi = {
  label: string;
  value: string;
  hint?: string;
  trendLabel?: string;
};

/** Public FAQ entries (static seed — not in CRUD state). */
export type FaqCategory = "Umum" | "Pricing" | "Proses" | "Engagement";
export type FaqItem = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
};

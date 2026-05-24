// Riset Kit — domain types.

export type DocStatus = "uploaded" | "indexed" | "reviewed";

export type Document = {
  id: string;
  title: string;
  authors: string;
  year: number;
  fileLabel: string; // "PDF · 24 hal"
  abstract: string;
  tag: string;
  status: DocStatus;
  uploadedAt: number;
  pages: number;
  highlights: number;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  linkedDocIds: string[];
  updatedAt: number;
};

export type CitationStyle = "APA" | "MLA" | "Chicago" | "IEEE" | "BibTeX";

export type Citation = {
  id: string;
  docId: string;
  style: CitationStyle;
  rendered: string;
  bibKey: string;
  addedAt: number;
};

export type LitReview = {
  id: string;
  topic: string;
  question: string;
  docIds: string[];
  matrix: { docId: string; method: string; finding: string; gap: string }[];
  updatedAt: number;
};

export type AiReaderSession = {
  id: string;
  docId: string;
  question: string;
  answer: string;
  ts: number;
};

/** Public publications — peer-reviewed / preprint output dari workspace. */
export type Publication = {
  id: string;
  slug: string;
  title: string;
  authors: string;
  year: number;
  venue: string;            // jurnal / konferensi / preprint server
  type: "journal" | "preprint" | "conference" | "report" | "chapter";
  doi: string;              // placeholder OK
  abstract: string;
  keywords: string[];
  pages?: string;           // "88-104"
  pdfHref?: string;         // "#" placeholder
};

/** Public reading-list — curated bacaan eksternal (bukan publikasi sendiri). */
export type PublicReadingItem = {
  id: string;
  title: string;
  source: string;           // jurnal / penulis / institusi
  year: number;
  category: "paper" | "essay" | "book" | "thread" | "report";
  href: string;             // external URL ("#" placeholder)
  why: string;              // why-it-matters blurb
  addedAt: number;
};

/** Public insights — short research-blog essays. Lebih ringan dari Publication. */
export type Insight = {
  id: string;
  slug: string;
  title: string;
  author: string;
  publishedAt: number;
  readMinutes: number;
  category: "methodology" | "tool-review" | "field-notes" | "opinion" | "tutorial";
  excerpt: string;
  body: string;             // markdown-ish plain text
  tags: string[];
};

/** Research project — long-running line of inquiry. */
export type ProjectStatus = "exploring" | "active" | "writing" | "submitted" | "archived";
export type Project = {
  id: string;
  title: string;
  hypothesis: string;
  status: ProjectStatus;
  startedAt: number;
  updatedAt: number;
  targetVenue: string;       // jurnal / konferensi sasaran
  linkedDocIds: string[];
  linkedNoteIds: string[];
  collaboratorIds: string[];
  progress: number;          // 0-100
};

/** Dataset registry — sumber data eksternal / olahan. */
export type Dataset = {
  id: string;
  name: string;
  source: string;            // institusi / portal
  format: "csv" | "json" | "parquet" | "xlsx" | "geojson" | "sav";
  rows: number;
  sizeMB: number;
  license: string;           // CC-BY-4.0 / proprietary / dst
  lastUpdated: number;
  description: string;
  url: string;               // "#" placeholder
};

/** Collaborator / co-author directory. */
export type Collaborator = {
  id: string;
  name: string;
  affiliation: string;
  role: "PI" | "co-author" | "advisor" | "RA" | "external";
  orcid: string;             // placeholder format 0000-0000-0000-0000
  email: string;
  expertise: string[];
  projectIds: string[];
  initials: string;
};

export type State = {
  documents: Document[];
  notes: Note[];
  citations: Citation[];
  litReviews: LitReview[];
  aiReaderSessions: AiReaderSession[];
  projects: Project[];
  datasets: Dataset[];
  collaborators: Collaborator[];
  /** O-wave: public pages CRUD slice. */
  pages: import("@/components/templates/_shared/pages/types").PageEntry[];
  /** AB-wave: home-page section composition. Ordered + toggleable. */
  landingSections: import("@/components/templates/_shared/landing/types").LandingSection[];
};

export type LandingSection = import("@/components/templates/_shared/landing/types").LandingSection;
export type LandingSectionKind = import("@/components/templates/_shared/landing/types").LandingSectionKind;
export type LandingAction = import("@/components/templates/_shared/landing/types").LandingAction;

export type Action =
  | import("@/components/templates/_shared/pages/types").PagesAction
  | LandingAction
  | { type: "doc.upsert"; doc: Document }
  | { type: "doc.delete"; id: string }
  | { type: "note.upsert"; note: Note }
  | { type: "note.delete"; id: string }
  | { type: "citation.upsert"; citation: Citation }
  | { type: "citation.delete"; id: string }
  | { type: "litreview.upsert"; lit: LitReview }
  | { type: "litreview.delete"; id: string }
  | { type: "aireader.create"; session: AiReaderSession }
  | { type: "aireader.upsert"; session: AiReaderSession }
  | { type: "aireader.delete"; id: string }
  | { type: "project.upsert"; project: Project }
  | { type: "project.delete"; id: string }
  | { type: "dataset.upsert"; dataset: Dataset }
  | { type: "dataset.delete"; id: string }
  | { type: "collaborator.upsert"; collaborator: Collaborator }
  | { type: "collaborator.delete"; id: string }
  | { type: "hydrate"; state: State }
  | { type: "reset" };

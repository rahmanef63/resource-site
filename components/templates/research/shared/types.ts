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

export type State = {
  documents: Document[];
  notes: Note[];
  citations: Citation[];
  litReviews: LitReview[];
  aiReaderSessions: AiReaderSession[];
};

export type Action =
  | { type: "doc.upsert"; doc: Document }
  | { type: "doc.delete"; id: string }
  | { type: "note.upsert"; note: Note }
  | { type: "note.delete"; id: string }
  | { type: "citation.upsert"; citation: Citation }
  | { type: "citation.delete"; id: string }
  | { type: "litreview.upsert"; lit: LitReview }
  | { type: "litreview.delete"; id: string }
  | { type: "aireader.create"; session: AiReaderSession }
  | { type: "hydrate"; state: State }
  | { type: "reset" };

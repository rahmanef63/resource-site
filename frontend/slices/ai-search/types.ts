/** Public types for ai-search slice. */

export type SourceKind = "website" | "notion" | "slack" | "files" | "github";

export type CorpusSource = {
  id: string;
  name: string;
  kind: SourceKind;
  weight: number;
  docCount: number;
  lastCrawledAt?: number;
};

export type Citation = {
  index: number;
  sourceId: string;
  excerpt?: string;
  url?: string;
};

export type AnswerChunk = {
  text: string;
  citations?: number[];
};

export type AskResult = {
  id: string;
  question: string;
  answer: string;
  chunks: AnswerChunk[];
  sources: CorpusSource[];
  citations: Citation[];
  followUps: string[];
  status: "streaming" | "done" | "error";
  costUsd?: number;
};

export type RerankerConfig = {
  topK: number;
  threshold: number;
  modelSlug: string;
};

export type AskBindings = {
  ask: unknown;
  history: unknown;
  corpus: unknown;
};

/**
 * ai-search slice — public barrel.
 *
 * Perplexity-style answer engine over a workspace corpus. Mount
 * `<AskBox />` at /ask. Ingestion + reranker tuning lives in admin.
 *
 *   import { AskBox, useAsk } from "@/features/ai-search";
 *
 * Status: scaffold (0.1.0). Real impl pending. UX target at
 * /preview/slices/ai-search.
 */

export type {
  CorpusSource, SourceKind, Citation, AnswerChunk,
  AskResult, RerankerConfig, AskBindings,
} from "./types";

/**
 * ai-first-app slice — public barrel.
 *
 * AI-first generation canvas. Single prompt input → streaming output
 * with variation grid + version tree. Suno / Midjourney / Lovable
 * pattern. Mount `<GeneratorCanvas />` as the root surface.
 *
 *   import { GeneratorCanvas, useGenerator } from "@/features/ai-first-app";
 *
 * Status: scaffold (0.1.0) — see /preview/slices/ai-first-app for UX
 * target. Real impl pending.
 */

export type {
  Generation, GenerationVariant, OutputKind,
  GenerationStatus, GeneratorBindings,
} from "./types";

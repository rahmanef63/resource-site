/**
 * ai-studio slice — public barrel.
 *
 * AI-first generation canvas. Single prompt input → output with a variation
 * grid + version tree. Suno / Midjourney / Lovable pattern. The page surface
 * (`AiStudioPage`) mounts at `/dashboard/ai-studio` via `page.tsx`.
 *
 *   import { aiStudioConfig } from "@/frontend/slices/ai-studio";
 *
 * Status: NON-FUNCTIONAL scaffold (0.1.0) — the generation call is stubbed.
 */

export { aiStudioConfig } from "./config";

export type {
  Generation, GenerationVariant, OutputKind,
  GenerationStatus, GeneratorBindings,
} from "./types";

// Static (non-functional) descriptor of the studio's generation tool.
export { aiStudioTools } from "./tools";
export type { AiStudioCtx } from "./tools";

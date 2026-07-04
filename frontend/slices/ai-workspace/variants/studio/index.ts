/**
 * ai-workspace › studio variant — AI generation canvas.
 *
 * Single prompt → streaming output with variation grid + version tree
 * (Suno / Midjourney / Lovable pattern). Mount `<AiStudioPage />` as the
 * root surface; drive generations through `aiStudioTools` from a shared agent.
 */
export { default as AiStudioPage } from "./views/AiStudioPage";
export type {
  Generation,
  GenerationVariant,
  OutputKind,
  GenerationStatus,
  GeneratorBindings,
} from "./types";
export { aiStudioTools } from "./tools";
export type { AiStudioCtx } from "./tools";

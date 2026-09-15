export { default as AiStudioPage } from "./components/AiStudioPage.svelte";
export { default as VersionTree } from "./components/VersionTree.svelte";
export { aiStudioTools, type AiStudioCtx } from "@/features/ai-workspace/variants/studio/tools";
export { runGeneration, localId, VARIATION_COUNT } from "@/features/ai-workspace/variants/studio/stub";
export type { Generation, GenerationStatus, GenerationVariant, GeneratorBindings, OutputKind } from "@/features/ai-workspace/variants/studio/types";

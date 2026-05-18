/**
 * Slice contract for `ai-studio` — v0.1.0.
 *
 * Single big prompt input → live-streaming generation canvas with iteration
 * toolbar (Suno / Midjourney / Lovable pattern). Prompt history, version
 * tree (branch & compare outputs), variation grid, share-to-link.
 *
 * Convex tables: aiStudioTables (see `convex/features/ai-studio/_schema.ts`).
 * Routes generation calls via `ai-router`; reads registries from `ai-admin`.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "ai-studio",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: ["studio.read", "studio.write"],
    env: [],
    deps: ["convex-auth", "ai-router", "ai-admin"],
  },
  provides: {
    components: [
      "StudioCanvas",
      "StudioPromptBar",
      "StudioVersionTree",
      "StudioVariationGrid",
    ],
  },
  conflicts: [],
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "portable",
      forbiddenTerms: ["rahmanef", "rahmanef.com"],
      requiredProps: [],
    },
  },
});

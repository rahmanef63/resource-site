/**
 * Stub generation logic for the studio canvas — scaffold only, no provider call.
 *
 * When wired for real, the generation dispatch belongs on the router backend
 * (`api.features.aiRouter`), gated by ensureUser +
 * requirePermission("ai-studio.generate") + logAuditEvent.
 */
import type { Generation, GenerationVariant, OutputKind } from "./types";

export const VARIATION_COUNT = 4;

/** Local id helper — scaffold only, not persisted. */
export function localId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Returns a resolved `Generation` with placeholder variants. No provider/SDK
 * call — replace with a mutation on `api.features.aiRouter` when wired for real.
 */
export function runGeneration(input: {
  prompt: string;
  kind: OutputKind;
  parentId?: string;
}): Generation {
  const variants: GenerationVariant[] = Array.from(
    { length: VARIATION_COUNT },
    (_, index) => ({
      id: localId("var"),
      index,
      outputInline: `[stub ${input.kind} variant ${index + 1}] "${input.prompt.slice(0, 48)}"`,
    }),
  );
  return {
    id: localId("gen"),
    workspaceId: "local",
    userId: "local",
    prompt: input.prompt,
    kind: input.kind,
    modelId: "stub-model",
    parentId: input.parentId,
    variants,
    status: "done",
    createdAt: Date.now(),
  };
}

// Agentic tool collection. The studio is NOT an agent — it exposes its
// generation surface as one tool so a shared agent can produce variants on
// the user's behalf. The ctx is an injectable thunk: bind it to your
// GeneratorBindings implementation (Convex, ai-router, …).

import { defineToolCollection, obj, str } from "@/shared/agentic";
import type { OutputKind } from "./types";

export type AiStudioCtx = {
  /** Run a generation; resolves to a short readback (id / inline output). */
  generate: (req: { prompt: string; kind: OutputKind }) => Promise<string>;
};

export const aiStudioTools = defineToolCollection<AiStudioCtx>({
  namespace: "ai-studio",
  instructions: "One-shot content generation. Give a clear prompt; treat the output as a draft for the user to review.",
  tools: [
    {
      name: "generate",
      description: "Create a new generation in the studio canvas from a prompt.",
      parameters: obj({
        "prompt!": str("generation prompt"),
        "kind!": str("output kind", { enum: ["image", "text", "code", "audio"] }),
      }),
      run: (ctx, a) =>
        ctx.generate({ prompt: a.prompt as string, kind: a.kind as OutputKind }),
    },
  ],
});

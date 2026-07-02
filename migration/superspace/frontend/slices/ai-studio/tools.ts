// Agentic tool descriptor — STUBBED.
//
// The rr original imported an agentic-tool framework (`@/shared/agentic`) so a
// shared agent could drive generations. SuperSpace has no such module, and this
// slice is a non-functional scaffold, so the framework glue is removed. What
// remains is a plain, typed descriptor of the tool the studio would expose. Wire
// it to a real agent + `api.features.aiRouter` dispatch when the slice goes live.

import type { OutputKind } from "./types";

export type AiStudioCtx = {
  /** Run a generation; resolves to a short readback (id / inline output). */
  generate: (req: { prompt: string; kind: OutputKind }) => Promise<string>;
};

/** Static descriptor of the studio's single generation tool (non-functional). */
export const aiStudioTools = {
  namespace: "ai-studio",
  instructions:
    "One-shot content generation. Give a clear prompt; treat the output as a draft for the user to review.",
  tools: [
    {
      name: "generate",
      description: "Create a new generation in the studio canvas from a prompt.",
      parameters: {
        prompt: { type: "string", required: true, description: "generation prompt" },
        kind: {
          type: "string",
          required: true,
          description: "output kind",
          enum: ["image", "text", "code", "audio"] as const,
        },
      },
      run: (ctx: AiStudioCtx, args: { prompt: string; kind: OutputKind }) =>
        ctx.generate({ prompt: args.prompt, kind: args.kind }),
    },
  ],
} as const;

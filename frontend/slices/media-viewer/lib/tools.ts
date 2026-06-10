// Agentic tool collection. The slice is NOT an agent — it exports this
// collection of function-calling tools and ONE shared agent (e.g. the
// assistant host) drives it alongside other slices' collections via
// @/shared/agentic. Viewer state is component-local, so the ctx is a small
// contract the mounted gallery satisfies (wrap your state setters and pass
// a thunk returning this object when registering).

import { defineToolCollection, noArgs, num, obj } from "@/shared/agentic";

export type MediaViewerCtx = {
  /** The file currently shown. */
  current: () => { name: string; kind: string; meta?: string };
  /** How many files the gallery holds. */
  count: () => number;
  /** Step the gallery (+1 next, -1 previous; wraps). */
  go: (delta: number) => void;
  zoom: () => number;
  /** Set zoom; the gallery clamps to its own range (0.4–3). */
  setZoom: (z: number) => void;
};

const info = (ctx: MediaViewerCtx): string => {
  const f = ctx.current();
  return `viewing "${f.name}" (${f.kind}${f.meta ? `, ${f.meta}` : ""}) | zoom ${ctx.zoom().toFixed(2)}x | ${ctx.count()} files`;
};

export const mediaViewerTools = defineToolCollection<MediaViewerCtx>({
  namespace: "media-viewer",
  describe: info,
  tools: [
    {
      name: "info",
      description: "Read back the current file (name, kind, metadata), zoom and file count.",
      parameters: noArgs,
      run: (ctx) => info(ctx),
    },
    {
      name: "next",
      description: "Show the next file (wraps around).",
      parameters: noArgs,
      run: (ctx) => {
        ctx.go(1);
        return `now: ${ctx.current().name}`;
      },
    },
    {
      name: "prev",
      description: "Show the previous file (wraps around).",
      parameters: noArgs,
      run: (ctx) => {
        ctx.go(-1);
        return `now: ${ctx.current().name}`;
      },
    },
    {
      name: "zoom.set",
      description: "Set the zoom factor (0.4–3; 1 = fit).",
      parameters: obj({ "z!": num("zoom factor", { min: 0.4, max: 3 }) }),
      run: (ctx, a) => {
        ctx.setZoom(a.z as number);
        return `zoom ${ctx.zoom().toFixed(2)}x`;
      },
    },
  ],
});
